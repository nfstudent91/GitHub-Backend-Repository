import { LeadRepository } from "../repositories/lead.repository";
import { Lead, LeadStatus } from "../entities/Lead";
import { StageRepository } from "../repositories/stage.repository";
import { UserRepository } from "../repositories/user.repository";
import { LeadAssignmentRepository } from "../repositories/leadAssignment.repository";
import { LeadAssignmentService } from "./leadAssignment.service";
import { EmailService } from "./email.service";
import { LeadAttemptRepository } from "../repositories/leadAttempt.repository";
import { LeadReminderRepository } from "../repositories/leadReminder.repository";
import { MetaFormRepository } from "../repositories/metaForm.repository";
import * as XLSX from "xlsx";
import fs from "fs";

export class LeadService {
  private leadRepository: LeadRepository;
  private stageRepository: StageRepository;
  private userRepository: UserRepository;
  private leadAssignmentRepository: LeadAssignmentRepository;
  private leadAssignmentService: LeadAssignmentService;
  private emailService: EmailService;
  private leadAttemptRepository: LeadAttemptRepository;
  private leadReminderRepository: LeadReminderRepository;
  private metaFormRepository: MetaFormRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
    this.stageRepository = new StageRepository();
    this.userRepository = new UserRepository();
    this.leadAssignmentRepository = new LeadAssignmentRepository();
    this.leadAssignmentService = new LeadAssignmentService();
    this.emailService = new EmailService();
    this.leadAttemptRepository = new LeadAttemptRepository();
    this.leadReminderRepository = new LeadReminderRepository();
    this.metaFormRepository = new MetaFormRepository();
  }

  async getAllLeads(): Promise<Lead[]> {
    return await this.leadRepository.findAll();
  }

  async getAllLeadsPaginated(
    page: number = 1,
    limit: number = 10,
    stageId?: number,
    search?: string,
    status?: string,
    userId?: number,
    visaCategory?: string,
    country?: string,
    date?: string,
    fromDate?: string,
    toDate?: string,
    exportAll?: boolean
  ): Promise<{ data: Lead[]; total: number; page: number; limit: number; totalPages: number }> {
    // Validate pagination parameters
    const pageNumber = Math.max(1, Math.floor(page));
    const pageSize = exportAll
      ? Math.max(1, Math.floor(limit)) // No cap for admin export
      : Math.max(1, Math.min(100, Math.floor(limit))); // Limit max page size to 100

    // Parse stageId if provided
    let stageIdFilter: number | undefined;
    let includeStatuses: string[] = [];
    let autoStageName: string | undefined;

    if (stageId !== undefined && stageId !== null) {
      const parsedStageId = parseInt(stageId.toString());
      if (!isNaN(parsedStageId)) {
        stageIdFilter = parsedStageId;

        // Auto-Stage Logic: Check if the stage is one of our special auto-stages
        const stage = await this.stageRepository.findById(stageIdFilter);
        if (stage) {
          const stageName = stage.name.toLowerCase();
          if (stageName === "cold") {
            autoStageName = "Cold";
            includeStatuses = ["New", "Not Answered", "Busy", "Visa Rejected"];
          } else if (stageName === "hot") {
            autoStageName = "Hot";
            includeStatuses = [
              "Answered",
              "Follow Up",
              "Meeting Scheduled",
              "Meeting Done",
              "Agreement Pending",
              "Agreement Done",
              "Payment Pending",
              "Payment Done",
              "Documentation",
              "Completed",
              "No Show",
              "Appointment Booked",
              "Visa Granted",
              "NIF Done",
              "Incorporation Done",
              "Decision Pending",
              "Endorsement Granted",
            ];
          } else if (stageName === "dead") {
            autoStageName = "Dead";
            includeStatuses = ["Not Interested", "Not Eligible", "Wrong Number", "Refunded"];
          }
        }
      }
    }

    const result = await this.leadRepository.findAllPaginated(
      pageNumber,
      pageSize,
      stageIdFilter,
      search,
      status,
      userId,
      includeStatuses,
      visaCategory,
      country,
      date,
      fromDate,
      toDate
    );

    // Self-healing: Update stageId for leads that match status but have wrong stageId
    if (autoStageName && stageIdFilter && result.data.length > 0) {
      const distinctUpdates = new Map<number, number>(); // leadId -> stageId

      for (const lead of result.data) {
        // If lead matches one of our auto-statuses but has a different stageId, fix it
        if (
          lead.stageId !== stageIdFilter &&
          lead.status &&
          includeStatuses.some(
            (s) => s.toLowerCase() === lead.status.toLowerCase()
          )
        ) {
          distinctUpdates.set(lead.id, stageIdFilter);
          // Update the object in memory so the response is correct immediately
          lead.stageId = stageIdFilter;
          lead.stage = await this.stageRepository.findById(stageIdFilter) as any;
        }
      }

      // Perform updates in background
      if (distinctUpdates.size > 0) {
        // We use a non-blocking promise here to not slow down the read operation too much
        (async () => {
          try {
            for (const [leadId, newStageId] of distinctUpdates.entries()) {
              await this.leadRepository.update(leadId, { stageId: newStageId });
            }
            console.log(
              `[Auto-Stage] Fixed stage for ${distinctUpdates.size} leads to '${autoStageName}'`
            );
          } catch (err) {
            console.error("[Auto-Stage] Error fixing stages:", err);
          }
        })();
      }
    }

    return result;
  }

  async getLeadById(id: number): Promise<Lead | null> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new Error("Lead not found");
    }
    return lead;
  }

  async getLeadsByUserId(
    userId: number,
    page: number = 1,
    limit: number = 10,
    filters?: {
      stageId?: number;
      status?: string;
      search?: string;
      visaCategory?: string;
      country?: string;
      date?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<{
    data: (Lead & { attemptCount: number })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalHotLeads: number;
    totalAttempts: number;
    pendingReminders: number;
  }> {
    // Validate pagination functionality
    const pageNumber = Math.max(1, Math.floor(page));
    const pageSize = Math.max(1, Math.min(100, Math.floor(limit)));
    // Validate user exists - optional but good practice
    // const user = await this.userRepository.findById(userId);
    // if (!user) {
    //   throw new Error("User not found");
    // }

    const { data, total } = await this.leadRepository.findLeadsByUserId(userId, pageNumber, pageSize, filters);
    const totalHotLeads = await this.leadRepository.countHotLeadsByUserId(userId);
    const totalAttempts = await this.leadAttemptRepository.countAttemptsByUserId(userId);
    const pendingReminders = await this.leadReminderRepository.countPendingRemindersByUserId(userId);
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      totalHotLeads,
      totalAttempts,
      pendingReminders,
    };
  }

  async getLeadsByStage(stageId: number): Promise<Lead[]> {
    // Verify stage exists
    const stage = await this.stageRepository.findById(stageId);
    if (!stage) {
      throw new Error("Stage not found");
    }
    return await this.leadRepository.findByStage(stageId);
  }

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    // Check for duplicates by email
    const cleanEmail = leadData.email?.trim().toLowerCase();
    if (cleanEmail && cleanEmail !== "") {
      const existingEmail = await this.leadRepository.findByEmail(cleanEmail);
      if (existingEmail) {
        throw new Error(`Lead with email "${cleanEmail}" already exists.`);
      }
      leadData.email = cleanEmail; // Save normalized version
    }

    // Check for duplicates by phone
    const cleanPhone = leadData.phone?.trim();
    if (cleanPhone && cleanPhone !== "") {
      const existingPhone = await this.leadRepository.findByPhone(cleanPhone);
      if (existingPhone) {
        throw new Error(`Lead with phone "${cleanPhone}" already exists.`);
      }
      leadData.phone = cleanPhone; // Save trimmed version
    }

    // Validate stage if provided
    if (leadData.stageId) {
      const stage = await this.stageRepository.findById(leadData.stageId);
      if (!stage) {
        console.warn(`Stage with ID ${leadData.stageId} not found. Attempting to create or find default stage.`);

        // For Meta or Website leads specifically, try to ensure the default "Cold" stage exists
        if (leadData.leadSource === 'Meta' || leadData.leadSource === 'Website') {
          try {
            // Try to find a "Cold" stage by name as fallback
            const coldStage = await this.stageRepository.findByName('Cold');
            if (coldStage) {
              console.log(`Using existing Cold stage with ID: ${coldStage.id}`);
              leadData.stageId = coldStage.id;
            } else {
              // If no Cold stage exists, create one as fallback
              const newColdStage = await this.stageRepository.create({
                name: 'Cold',
                isActive: true
              });
              console.log(`Created new Cold stage with ID: ${newColdStage.id}`);
              leadData.stageId = newColdStage.id;
            }
          } catch (error) {
            console.error('Failed to create fallback stage:', error);
            // Fallback to stage ID 1 if possible, or throw a more descriptive error
            leadData.stageId = 1; // Try default ID as last resort
          }
        } else {
          throw new Error(`Invalid stage ID ${leadData.stageId}. Stage does not exist.`);
        }
      }
    }

    const createdLead = await this.leadRepository.create(leadData);

    // Send welcome email if email exists in formData
    if (createdLead && createdLead.formData && createdLead.formData.email) {
      // Don't await email sending to prevent blocking the response
      const email = createdLead.formData.email;
      const name = createdLead.formData.name || createdLead.formData.firstName || "Valued Customer";
      this.emailService.sendWelcomeEmail(email, name).catch(err => console.error("Failed to send welcome email:", err));
    }

    // Auto-assign lead
    if (createdLead) {
      let assignedToId: number | undefined;
      // Get assignedBy from formData or default to 1 (System/Admin)
      const assignedById = leadData.formData?.assignedBy ? parseInt(leadData.formData.assignedBy) : 1;
      const createdByName = leadData.createdBy || "system";

      // 1. Check if assignedTo is provided at the top level or in formData
      const leadDataAny = leadData as any;
      if (leadDataAny.assignedTo) {
        assignedToId = typeof leadDataAny.assignedTo === 'string' ? parseInt(leadDataAny.assignedTo) : leadDataAny.assignedTo as number;
      } else if (leadData.formData && leadData.formData.assignedTo) {
        assignedToId = parseInt(leadData.formData.assignedTo);
      }

      // 2. If no specific assignment, assign to a TeleCaller using round-robin distribution
      if (!assignedToId || isNaN(assignedToId)) {
        try {
          const telleCallers = await this.userRepository.findTelleCallers();
          if (telleCallers && telleCallers.length > 0) {
            // Fetch total assignments to determine the next person in sequence
            const assignmentCount = await this.leadAssignmentRepository.count();
            const nextIndex = assignmentCount % telleCallers.length;
            assignedToId = telleCallers[nextIndex].id;
          }
        } catch (err) {
          console.error("Failed to fetch telecallers for auto-assignment:", err);
        }
      }

      // 3. Create assignment if we have a target user
      if (assignedToId && !isNaN(assignedToId)) {
        try {
          await this.leadAssignmentService.createAssignment({
            leadId: createdLead.id,
            assignedTo: assignedToId,
            assignedBy: assignedById, // System/Admin or specific user
            remarks: "Auto-assigned on creation",
            createdBy: createdByName,
          });
        } catch (err) {
          console.error("Failed to auto-assign lead:", err);
          // Do not throw error to avoid failing the lead creation response
        }
      }
    }

    return createdLead;
  }

  async updateLead(id: number, leadData: Partial<Lead>): Promise<Lead | null> {
    // Check if lead exists
    const existingLead = await this.leadRepository.findById(id);
    if (!existingLead) {
      throw new Error("Lead not found");
    }

    // Validate stage if provided
    if (leadData.stageId) {
      const stage = await this.stageRepository.findById(leadData.stageId);
      if (!stage) {
        throw new Error("Invalid stage ID");
      }
    }

    // Auto-update stage based on status if status is changing
    if (leadData.status) {
      try {
        const targetStageId = await this.getStageIdByStatus(leadData.status);
        if (targetStageId) {
          leadData.stageId = targetStageId;
        }
      } catch (err) {
        console.error("Failed to auto-update stage based on status:", err);
      }
    }

    return await this.leadRepository.update(id, leadData);
  }

  private async getStageIdByStatus(status: LeadStatus): Promise<number | undefined> {
    let targetStageName: string | undefined;

    const coldStatuses = [LeadStatus.NEW, LeadStatus.NOT_ANSWERED, LeadStatus.BUSY, LeadStatus.VISA_REJECTED];
    const deadStatuses = [LeadStatus.NOT_INTERESTED, LeadStatus.NOT_ELIGIBLE, LeadStatus.WRONG_NUMBER, LeadStatus.REFUNDED];
    const hotStatuses = [
      LeadStatus.ANSWERED,
      LeadStatus.FOLLOW_UP,
      LeadStatus.MEETING_SCHEDULED,
      LeadStatus.MEETING_DONE,
      LeadStatus.AGREEMENT_PENDING,
      LeadStatus.AGREEMENT_DONE,
      LeadStatus.PAYMENT_PENDING,
      LeadStatus.PAYMENT_DONE,
      LeadStatus.DOCUMENTATION,
      LeadStatus.COMPLETED,
      LeadStatus.NO_SHOW,
      LeadStatus.APPOINTMENT_BOOKED,
      LeadStatus.VISA_GRANTED,
      LeadStatus.NIF_DONE,
      LeadStatus.INCORPORATION_DONE,
      LeadStatus.DECISION_PENDING,
      LeadStatus.ENDORSEMENT_GRANTED,
    ];

    if (coldStatuses.includes(status)) {
      targetStageName = "Cold";
    } else if (deadStatuses.includes(status)) {
      targetStageName = "Dead";
    } else if (hotStatuses.includes(status)) {
      targetStageName = "Hot";
    }

    if (targetStageName) {
      const stage = await this.stageRepository.findByName(targetStageName);
      return stage?.id;
    }

    return undefined;
  }

  async deleteLead(id: number): Promise<boolean> {
    // Check if lead exists
    const existingLead = await this.leadRepository.findById(id);
    if (!existingLead) {
      throw new Error("Lead not found");
    }

    return await this.leadRepository.delete(id);
  }

  async getLeadCount(): Promise<number> {
    return await this.leadRepository.count();
  }

  async getLeadCountByStage(stageId: number): Promise<number> {
    return await this.leadRepository.countByStage(stageId);
  }

  async bulkImportLeads(
    filePath: string,
    fileName: string,
    createdBy?: string,
    assignedTo?: number
  ): Promise<{
    success: number;
    failed: number;
    duplicates: number;
    newRecords: number;
    errors: string[];
    total: number;
  }> {
    const errors: string[] = [];
    let rowsData: Record<string, any>[] = [];

    // Determine file type and parse accordingly
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    if (fileExtension === "csv") {
      rowsData = this.parseCSV(filePath);
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      rowsData = this.parseExcel(filePath);
    } else {
      throw new Error("Unsupported file format. Please upload CSV or Excel file (.csv, .xlsx, .xls)");
    }

    if (rowsData.length === 0) {
      throw new Error("No data found in the file");
    }

    // Validate and process each lead
    const validLeads: Partial<Lead>[] = [];

    // Define keys that map to entity properties and should be excluded from formData
    const EXCLUDED_KEYS = new Set([
      "stageId", "stage_id", "stage",
      "status",
      "Name", "fullname", "fullName", "full_name",
      "Email", "email",
      "Phone", "phone",
      "Whats App", "WhatsApp", "whatsapp", "WhatApp Number", "WhatsApp Number", "WhatsAppNumber",
      "Lead Name", "Lead Date", "leadDate", "lead_date",
      "Lead Source", "leadSource", "lead_source",
      "Lead Subsource", "leadSubsource", "lead_subsource",
      "Monthly Income", "monthlyIncome", "monthly_income",
      "Job Title", "jobTitle", "job_title",
      "Visa Category", "visaCategory", "visa_category",
      "Country", "country",
      "Target Country", "targetCountry", "target_country"
    ]);

    for (let i = 0; i < rowsData.length; i++) {
      const row = rowsData[i];
      const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

      try {
        // Store only non-entity columns in formData as JSON
        const formData: Record<string, any> = {};

        // Copy fields from row to formData if they are NOT in EXCLUDED_KEYS
        Object.keys(row).forEach((key) => {
          if (EXCLUDED_KEYS.has(key)) return; // Skip entity keys

          const value = row[key];
          if (value !== null && value !== undefined && value !== "") {
            formData[key] = typeof value === "string" ? value.trim() : value;
          }
        });

        // Validate stage if provided
        let stageId: number | undefined = undefined;
        if (row.stageId || row.stage_id || row.stage) {
          const stageValue = row.stageId || row.stage_id || row.stage;
          const parsedStageId = typeof stageValue === "string" ? parseInt(stageValue, 10) : Number(stageValue);
          if (!isNaN(parsedStageId)) {
            const stage = await this.stageRepository.findById(parsedStageId);
            if (!stage) {
              errors.push(`Row ${rowNumber}: Invalid stage ID "${stageValue}"`);
              continue;
            }
            stageId = parsedStageId;
          }
        }

        // Parse status if provided
        let status: LeadStatus = LeadStatus.NEW;
        if (row.status) {
          status = this.parseStatus(row.status);
        }

        // Build lead object with formData
        const leadData: Partial<Lead> = {
          formData: formData,
          stageId: stageId,
          status: status,
          isActive: true,
          createdBy: createdBy || "system",
          // Map specific columns from row
          fullname: (row.Name || row.fullname || row.fullName || row.full_name || row["Lead Name"])?.toString().trim(),
          email: (row.Email || row.email)?.toString().trim().toLowerCase(),
          phone: (row.Phone || row.phone)?.toString().trim(),
          whatsapp: (row.WhatsApp || row.whatsapp || row.WhatsAppNumber)?.toString().trim(),
          leadDate: row["Lead Date"] || row.leadDate || row.lead_date,
          // leadOwner: row["Lead Owner"] || row.leadOwner || row.lead_owner,
          leadSource: row["Lead Source"] || row.leadSource || row.lead_source,
          leadSubsource: row["Lead Subsource"] || row.leadSubsource || row.lead_subsource,
          monthlyIncome: this.parseNumber(row["Monthly Income"] || row.monthlyIncome || row.monthly_income),
          jobTitle: row["Job Title"] || row.jobTitle || row.job_title,
          visaCategory: row["Visa Category"] || row.visaCategory || row.visa_category,
          country: row["Country"] || row.country,
          targetCountry: row["Target Country"] || row.targetCountry || row.target_country,
        };

        validLeads.push(leadData);
      } catch (error: any) {
        errors.push(`Row ${rowNumber}: ${error.message || "Unknown error"}`);
      }
    }

    // Bulk insert valid leads
    let successCount = 0;
    let createdLeads: Lead[] = [];
    let skippedCount = 0;

    if (validLeads.length > 0) {
      try {
        // Feature: If email or phone exists then I don't to insert into database else insert new records.
        const emailsToCheck = validLeads
          .map((lead) => lead.email)
          .filter((email) => email !== undefined && email !== null && email !== "") as string[];

        const phonesToCheck = validLeads
          .map((lead) => lead.phone)
          .filter((phone) => phone !== undefined && phone !== null && phone !== "") as string[];

        // Remove duplicates within the file itself (keep first occurrence)
        const uniqueEmailsInFile = new Set<string>();
        const uniquePhonesInFile = new Set<string>();
        const uniqueValidLeads: Partial<Lead>[] = [];

        for (const lead of validLeads) {
          let isDuplicate = false;

          if (lead.email && uniqueEmailsInFile.has(lead.email.toLowerCase())) {
            isDuplicate = true;
          }

          if (lead.phone && uniquePhonesInFile.has(lead.phone.trim())) {
            isDuplicate = true;
          }

          if (!isDuplicate) {
            if (lead.email) uniqueEmailsInFile.add(lead.email.toLowerCase());
            if (lead.phone) uniquePhonesInFile.add(lead.phone.trim());
            uniqueValidLeads.push(lead);
          } else {
            skippedCount++;
          }
        }

        let leadsToInsert = uniqueValidLeads;

        // Check against existing database records
        const existingEmails = new Set<string>();
        const existingPhones = new Set<string>();

        if (emailsToCheck.length > 0) {
          const leadsWithEmails = await this.leadRepository.findByEmails(emailsToCheck);
          leadsWithEmails.forEach(l => existingEmails.add(l.email.toLowerCase()));
        }

        if (phonesToCheck.length > 0) {
          const leadsWithPhones = await this.leadRepository.findByPhones(phonesToCheck);
          leadsWithPhones.forEach(l => existingPhones.add(l.phone.trim()));
        }

        leadsToInsert = uniqueValidLeads.filter((lead) => {
          if (lead.email && existingEmails.has(lead.email.toLowerCase())) {
            skippedCount++;
            return false;
          }
          if (lead.phone && existingPhones.has(lead.phone.trim())) {
            skippedCount++;
            return false;
          }
          return true;
        });

        if (leadsToInsert.length > 0) {
          createdLeads = await this.leadRepository.bulkCreate(leadsToInsert);
          successCount = leadsToInsert.length;
        } else {
          successCount = 0;
        }

        // Assignment strategy:
        // - If assignedTo is provided, assign all created leads to that user
        // - Otherwise, fall back to existing auto-assignment to telecallers
        try {
          if (createdLeads.length > 0) {
            if (assignedTo) {
              const assignments = createdLeads.map((lead) => ({
                leadId: lead.id,
                assignedTo,
                assignedBy: 1, // System user ID, you can modify this as needed
                remarks: "Assigned via bulk import selection",
                createdBy: createdBy || "system",
              }));

              await this.leadAssignmentRepository.bulkCreate(assignments);
            } else {
              const telleCallers = await this.userRepository.findTelleCallers();

              if (telleCallers && telleCallers.length > 0) {
                // Fetch current assignment count to maintain global round-robin sequence
                const currentAssignmentCount = await this.leadAssignmentRepository.count();

                const assignments = createdLeads.map((lead, index) => {
                  // Select a telleCaller using global round-robin distribution
                  const selectedTeleCaller =
                    telleCallers[(currentAssignmentCount + index) % telleCallers.length];

                  return {
                    leadId: lead.id,
                    assignedTo: selectedTeleCaller.id,
                    assignedBy: 1, // System user ID, you can modify this as needed
                    remarks: "Auto-assigned during bulk import",
                    createdBy: createdBy || "system",
                  };
                });

                // Bulk create assignments
                await this.leadAssignmentRepository.bulkCreate(assignments);
              }
            }
          }
        } catch (assignmentError: any) {
          // Log assignment error but don't fail the entire import
          console.error("Assignment error:", assignmentError);
          errors.push(`Assignment warning: ${assignmentError.message}`);
        }
      } catch (error: any) {
        errors.push(`Bulk insert error: ${error.message}`);
      }
    }

    // Clean up uploaded file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Ignore file deletion errors
    }

    return {
      success: successCount, // Kept for backward compatibility if needed, but newRecords is more explicit
      newRecords: successCount,
      duplicates: skippedCount,
      failed: rowsData.length - successCount - skippedCount,
      errors,
      total: rowsData.length,
    };
  }

  private parseExcel(filePath: string): Record<string, any>[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    // Return all columns as-is
    return data as Record<string, any>[];
  }

  private parseCSV(filePath: string): Record<string, any>[] {
    // Read file and detect encoding
    let fileContent: string;
    try {
      // Try UTF-8 first
      fileContent = fs.readFileSync(filePath, "utf-8");

      // Check for BOM and remove it
      if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.slice(1);
      }

      // If we see NULL bytes, it might be UTF-16
      if (fileContent.includes('\u0000')) {
        fileContent = fs.readFileSync(filePath, "utf16le");
        // Remove BOM if present
        if (fileContent.charCodeAt(0) === 0xFEFF) {
          fileContent = fileContent.slice(1);
        }
      }
    } catch (error) {
      // Fallback to latin1
      fileContent = fs.readFileSync(filePath, "latin1");
    }

    const lines = fileContent.split("\n").filter((line) => line.trim() !== "");

    if (lines.length < 2) {
      return [];
    }

    // Detect delimiter (comma or tab)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    // Parse header
    const headers = this.parseCSVLine(lines[0], delimiter);

    // Parse data rows
    const rows: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i], delimiter);
      if (values.length === 0) continue;

      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        const cleanHeader = header.trim();
        const value = values[index] || "";
        if (value && value.trim()) {
          row[cleanHeader] = value.trim();
        }
      });

      // Only add row if it has at least one non-empty value
      if (Object.keys(row).length > 0) {
        rows.push(row);
      }
    }

    return rows;
  }

  private parseCSVLine(line: string, delimiter: string = ','): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else if (char !== '\r') {  // Skip carriage return
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }
    const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : Number(value);
    return isNaN(num) ? undefined : num;
  }

  private parseBoolean(value: any): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lower = value.toLowerCase().trim();
      return lower === "true" || lower === "yes" || lower === "1" || lower === "y";
    }
    return Boolean(value);
  }

  private parseStatus(value: any): LeadStatus {
    if (typeof value === "string") {
      const lower = value.toLowerCase().trim();
      if (lower === "new") return LeadStatus.NEW;
      if (lower === "not answered") return LeadStatus.NOT_ANSWERED;
      if (lower === "busy") return LeadStatus.BUSY;
      if (lower === "answered") return LeadStatus.ANSWERED;
      if (lower === "follow up") return LeadStatus.FOLLOW_UP;
      if (lower === "meeting scheduled") return LeadStatus.MEETING_SCHEDULED;
      if (lower === "meeting done") return LeadStatus.MEETING_DONE;
      if (lower === "agreement pending") return LeadStatus.AGREEMENT_PENDING;
      if (lower === "agreement done") return LeadStatus.AGREEMENT_DONE;
      if (lower === "payment pending") return LeadStatus.PAYMENT_PENDING;
      if (lower === "payment done") return LeadStatus.PAYMENT_DONE;
      if (lower === "completed") return LeadStatus.COMPLETED;
      if (lower === "documentation") return LeadStatus.DOCUMENTATION;
      if (lower === "not eligible") return LeadStatus.NOT_ELIGIBLE;
      if (lower === "no show") return LeadStatus.NO_SHOW;
      if (lower === "wrong number") return LeadStatus.WRONG_NUMBER;
      if (lower === "appointment booked") return LeadStatus.APPOINTMENT_BOOKED;
      if (lower === "visa granted") return LeadStatus.VISA_GRANTED;
      if (lower === "nif done") return LeadStatus.NIF_DONE;
      if (lower === "incorporation done") return LeadStatus.INCORPORATION_DONE;
      if (lower === "decision pending") return LeadStatus.DECISION_PENDING;
      if (lower === "endorsement granted") return LeadStatus.ENDORSEMENT_GRANTED;
      if (lower === "visa rejected") return LeadStatus.VISA_REJECTED;
      if (lower === "refunded") return LeadStatus.REFUNDED;
    }
    return LeadStatus.NEW;
  }

  async searchLeadsWithCursor(leadId?: number): Promise<Lead[]> {
    return await this.leadRepository.searchLeadsWithCursor(leadId);
  }

  async getPaymentReceivedLeads(
    page: number = 1,
    limit: number = 10,
    userId: number
  ): Promise<{ data: Lead[]; total: number; page: number; limit: number; totalPages: number }> {
    // keys off LeadStatus.PAYMENT_DONE set to "Payment Done"
    return await this.leadRepository.findPaymentReceivedPaginated(
      page,
      limit,
      userId
    );
  }

  async getUniqueCountries(): Promise<string[]> {
    return await this.leadRepository.getUniqueCountries();
  }

  async getUniqueVisaCategories(): Promise<string[]> {
    return await this.leadRepository.getUniqueVisaCategories();
  }

  // --- Meta / Facebook Lead Ads integration ---

  /**
   * Fetch lead from Meta Graph API by leadgen_id and create/process as lead.
   * Used by the Meta webhook; errors are logged and not rethrown to avoid webhook retries.
   */
  async fetchAndProcessMetaLead(leadId: string): Promise<void> {
    try {
      const accessToken = process.env.META_PAGE_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error("META_PAGE_ACCESS_TOKEN not configured");
      }
      if (!leadId || typeof leadId !== "string" || !/^\d+$/.test(leadId)) {
        throw new Error(`Invalid lead ID format: ${leadId}`);
      }
      const url = `https://graph.facebook.com/v18.0/${leadId}?fields=id,created_time,field_data,form_id&access_token=${accessToken}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        const errorJson = JSON.parse(errorText);
        if (response.status === 400 && errorJson.error?.code === 100) {
          console.warn(
            `Lead ID ${leadId} may be invalid or already processed:`,
            errorJson.error.message
          );
          return;
        }
        throw new Error(`Facebook API error (${response.status}): ${errorText}`);
      }
      const leadData = await response.json() as any;
      console.log(`[Meta] Fetched lead ${leadId}, form_id: ${leadData.form_id || 'NOT FOUND'}`);
      await this.processMetaLeadData(leadData);
    } catch (error) {
      console.error("Error fetching/processing Meta lead:", error);
      // Don't rethrow so webhook can return 200 and avoid retries
    }
  }

  /**
   * Transform Meta Graph API lead payload into our lead shape and create lead.
   */
  async processMetaLeadData(leadData: any): Promise<void> {
    try {
      const formData: Record<string, any> = {};
      if (leadData.field_data && Array.isArray(leadData.field_data)) {
        leadData.field_data.forEach((field: any) => {
          const raw = field.values ? field.values[0] : "";
          formData[field.name] =
            typeof raw === "object" && raw !== null ? JSON.stringify(raw) : raw;
        });
      }

      const parseFormNumber = (v: any): number | undefined => {
        if (v === undefined || v === null || v === "") return undefined;
        const n = typeof v === "number" ? v : parseInt(String(v), 10);
        return isNaN(n) ? undefined : n;
      };
      const str = (v: any) =>
        v !== undefined && v !== null && v !== "" ? String(v).trim() : undefined;

      // --- Cache Meta Form Name ---
      if (leadData.form_id) {
        try {
          const formId = String(leadData.form_id);
          const existingForm = await this.metaFormRepository.findByFormId(formId);

          if (!existingForm) {
            // Fetch form details from Meta
            const accessToken = process.env.META_PAGE_ACCESS_TOKEN;
            if (accessToken) {
              const formUrl = `https://graph.facebook.com/v18.0/${formId}?access_token=${accessToken}`;
              const formResponse = await fetch(formUrl);

              if (formResponse.ok) {
                const formDataApi = (await formResponse.json()) as any;
                await this.metaFormRepository.create({
                  formId: formId,
                  name: formDataApi.name || `Form ${formId}`, // Fallback if name is missing
                });
                console.log(`[Meta] Cached new form: ${formDataApi.name} (${formId})`);
              } else {
                console.warn(`[Meta] Failed to fetch form name for ${formId}: ${formResponse.statusText}`);
                // Optionally create a placeholder so we don't retry every time? 
                // For now, we'll just skip and try again next time.
              }
            }
          }
        } catch (formError) {
          console.error("[Meta] Error caching form name:", formError);
          // Don't block lead creation
        }
      }
      // -----------------------------

      const leadToCreate: Partial<Lead> = {
        fullname: this.extractFullNameFromFormData(formData),
        email: formData.email || "",
        phone: formData.phone_number || formData.phone || "",
        whatsapp:
          str(formData.whatsapp || formData.whatsapp_number || formData.phone_number) ?? undefined,
        leadSource: "Meta",
        leadSubsource: leadData.form_id || "facebook_lead_form",
        jobTitle: str(formData.job_title || formData.jobTitle),
        monthlyIncome: parseFormNumber(formData.monthly_income || formData.monthlyIncome),
        visaCategory: str(formData.visa_category || formData.visaCategory),
        country: str(formData.country),
        targetCountry: str(formData.target_country || formData.targetCountry),
        formData: {
          ...formData,
          meta_lead_id: leadData.id,
          raw_meta_data:
            typeof leadData === "object" ? JSON.stringify(leadData) : leadData,
          created_time: leadData.created_time,
        },
        stageId: 1,
        status: LeadStatus.NEW,
      };

      await this.createLead(leadToCreate);
    } catch (error) {
      console.error("Error processing lead data:", error);
    }
  }

  private extractFullNameFromFormData(formData: Record<string, any>): string {
    if (formData.full_name && String(formData.full_name).trim()) {
      return String(formData.full_name).trim();
    }
    if (formData.first_name || formData.last_name) {
      return `${formData.first_name || ""} ${formData.last_name || ""}`.trim();
    }
    if (formData.name && String(formData.name).trim()) {
      return String(formData.name).trim();
    }
    return "Unknown Name";
  }
   /**
   * Process lead data from an external website (WordPress, etc.)
   */
  async processWebsiteLead(data: any): Promise<any> {
    try {
      const str = (v: any) =>
        v !== undefined && v !== null && v !== "" ? String(v).trim() : undefined;

      const parseFormNumber = (v: any): number | undefined => {
        if (v === undefined || v === null || v === "") return undefined;
        const n = typeof v === "number" ? v : parseInt(String(v), 10);
        return isNaN(n) ? undefined : n;
      };

      // Handle common WordPress form field variations
      const fullname = str(data.fullname || data.full_name || data.name || data.first_name || data.firstName);
      const first_name = str(data.first_name || data.firstName);
      const last_name = str(data.last_name || data.lastName);
      const finalFullname = fullname || (first_name || last_name ? `${first_name || ""} ${last_name || ""}`.trim() : "Website Lead");

      const leadToCreate: Partial<Lead> = {
        fullname: finalFullname,
        email: str(data.email || data.user_email || data.Email || ""),
        phone: str(data.phone || data.mobile_number || data.phone_number || data.telephone || ""),
        whatsapp: str(data.whatsapp || data.whatsapp_number || data.phone || ""),
        leadSource: str(data.leadSource || data.source || "Website"),
        leadSubsource: str(data.leadSubsource || data.subsource || data.form_name || "WordPress"),
        jobTitle: str(data.jobTitle || data.job_title || data.occupation),
        monthlyIncome: parseFormNumber(data.monthlyIncome || data.monthly_income || data.income),
        visaCategory: str(data.visaCategory || data.visa_category || data.category),
        country: str(data.country || data.current_country),
        targetCountry: str(data.targetCountry || data.target_country),
        formData: { ...data },
        stageId: data.stageId ? parseInt(data.stageId) : 1, // Default stage ID
        status: LeadStatus.NEW,
        createdBy: "website_webhook"
      };

      return await this.createLead(leadToCreate);
    } catch (error) {
      console.error("Error processing website lead: ", error);
      throw error;
    }
  }
}

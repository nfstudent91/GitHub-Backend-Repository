import { Request, Response } from "express";
import { LeadService } from "../services/lead.service";

export class LeadController {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  // GET /api/leads - Get all leads (with pagination)
  getAllLeads = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get pagination parameters from query string
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Get filter parameters from query string
      const stageId =
        req.query.stageId !== undefined
          ? parseInt(req.query.stageId as string)
          : undefined;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const visaCategory = req.query.visaCategory as string | undefined;
      const country = req.query.country as string | undefined;
      const assignedTo = req.query.assignedTo
        ? parseInt(req.query.assignedTo as string)
        : undefined;
      const date = req.query.date as string | undefined;
      const fromDate = req.query.fromDate as string | undefined;
      const toDate = req.query.toDate as string | undefined;
      const exportAll = req.query.export === "true" && req.user?.roleName === "Admin";

      // Use paginated method
      const result = await this.leadService.getAllLeadsPaginated(
        page,
        limit,
        stageId,
        search,
        status,
        assignedTo, // userId
        visaCategory,
        country,
        date,
        fromDate,
        toDate,
        exportAll
      );

      res.status(200).json({
        success: true,
        message: "Leads retrieved successfully",
        data: result.data.map((lead) => {
          const { assignments, ...rest } = lead;
          // Sort assignments by ID descending to get the latest one strictly
          const sortedAssignments = assignments ? assignments.sort((a, b) => b.id - a.id) : [];
          const lastAssignment = sortedAssignments.length > 0 ? sortedAssignments[0] : null;

          return {
            ...rest,
            leadOwner: lastAssignment?.assignedToUser?.fullname || null,
            assignedTo: lastAssignment?.assignedToUser?.fullname || null,
            assignedBy: lastAssignment?.assignedByUser?.fullname || null,
          };
        }),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving leads",
        error: error.message,
      });
    }
  };

  // GET /api/leads/:id - Get lead by ID
  getLeadById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
        return;
      }

      const lead = await this.leadService.getLeadById(id);

      const currentUser = req.user;
      let filteredAttempts = lead?.attempts || [];
      let filteredHistories = lead?.histories || [];
      let filteredNotes = lead?.notes || [];

      // If not admin or manager, check for restrictions based on current assignment
      if (currentUser && currentUser.roleName !== 'Admin' && currentUser.roleName !== 'Manager') {
        const userAssignments = lead?.assignments?.filter(a => a.assignedTo === currentUser.id) || [];

        // Sort by ID descending to get the latest assignment for this user
        const latestUserAssignment = userAssignments.sort((a, b) => b.id - a.id)[0];

        if (!latestUserAssignment) {
          res.status(403).json({
            success: false,
            message: "Access forbidden: You are not assigned to this lead",
          });
          return;
        }

        if (latestUserAssignment.canAccessPreviousLogs === false) {
          const userIdentifier = currentUser.username || currentUser.fullname;
          console.log("userIdentifier = ", userIdentifier);
          // Filter attempts and notes to only show those created by the current user
          filteredAttempts = filteredAttempts.filter(a => a.createdBy === userIdentifier);
          filteredNotes = filteredNotes.filter(n => n.createdBy === userIdentifier);

          // Filter history to only show records where the user was the target assignee
          filteredHistories = filteredHistories.filter(h => h.assignedTo === currentUser.id);
        }
      }

      // Filter attempts by type
      const calls = filteredAttempts.filter(a => a.followType?.name === 'Call') || [];
      const whatsApp = filteredAttempts.filter(a => a.followType?.name === 'WhatsApp') || [];
      const email = filteredAttempts.filter(a => a.followType?.name === 'Email') || [];

      // Get list of all users who have been assigned to this lead (Chronological, start to end)
      let assignedUsers: any[] = [];

      // Helper to process user
      const processUser = (user: any) => {
        if (user && user.id) {
          // Create a clean user object without sensitive data
          const { password, ...safeUser } = user;
          return safeUser;
        }
        return null;
      };

      // Add users from histories (Sorted by ID/Creation)
      if (lead?.histories && lead.histories.length > 0) {
        // Sort histories by ID ascending to get start to end
        const sortedHistories = [...lead.histories].sort((a, b) => a.id - b.id);

        assignedUsers = sortedHistories
          .map((history: any) => processUser(history.assignedToUser))
          .filter(u => u !== null);
      } else if (lead?.assignments && lead.assignments.length > 0) {
        // Fallback to assignments if no history (though history should exist)
        const sortedAssignments = [...lead.assignments].sort((a, b) => a.id - b.id);
        assignedUsers = sortedAssignments
          .map((assignment: any) => processUser(assignment.assignedToUser))
          .filter(u => u !== null);
      }

      res.status(200).json({
        success: true,
        message: "Lead retrieved successfully",
        data: {
          ...lead,
          assignedUsers,
          attempts: filteredAttempts,
          histories: filteredHistories,
          notes: filteredNotes,
          calls,
          whatsApp,
          emails: email
        },
      });
    } catch (error: any) {
      if (error.message === "Lead not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error retrieving lead",
          error: error.message,
        });
      }
    }
  };

  // GET /api/leads/user/:userId - Get leads by user ID
  getLeadsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      // Get pagination parameters from query string
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        stageId: req.query.stageId ? parseInt(req.query.stageId as string) : undefined,
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
        visaCategory: req.query.visaCategory as string | undefined,
        country: req.query.country as string | undefined,
        date: req.query.date as string | undefined,
        fromDate: req.query.fromDate as string | undefined,
        toDate: req.query.toDate as string | undefined,
      };

      const result = await this.leadService.getLeadsByUserId(userId, page, limit, filters);

      res.status(200).json({
        success: true,
        message: "Leads retrieved successfully",
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        count: result.data.length,
        totalHotLeads: result.totalHotLeads,
        totalAttempts: result.totalAttempts,
        pendingReminders: result.pendingReminders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving leads",
        error: error.message,
      });
    }
  };

  // GET /api/leads/stage/:stageId - Get leads by stage
  getLeadsByStage = async (req: Request, res: Response): Promise<void> => {
    try {
      const stageId = parseInt(req.params.stageId);

      if (isNaN(stageId)) {
        res.status(400).json({
          success: false,
          message: "Invalid stage ID",
        });
        return;
      }

      const leads = await this.leadService.getLeadsByStage(stageId);
      res.status(200).json({
        success: true,
        message: "Leads retrieved successfully",
        data: leads,
        count: leads.length,
      });
    } catch (error: any) {
      if (
        error.message === "Stage not found" ||
        error.message === "Lead not found"
      ) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error retrieving leads",
          error: error.message,
        });
      }
    }
  };

  // POST /api/leads - Create new lead
  createLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const leadData = req.body;

      // Add createdBy from authenticated user if available
      if (req.user && !leadData.createdBy) {
        leadData.createdBy = req.user.username || req.user.fullname;
      }

      const lead = await this.leadService.createLead(leadData);
      res.status(201).json({
        success: true,
        message: "Lead created successfully",
        data: lead,
      });
    } catch (error: any) {
      if (
        error.message.includes("already exists") ||
        error.message.includes("required") ||
        error.message.includes("Invalid")
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error creating lead",
          error: error.message,
        });
      }
    }
  };

  // PUT /api/leads/:id - Update lead
  updateLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
        return;
      }

      const leadData = req.body;
      const lead = await this.leadService.updateLead(id, leadData);
      res.status(200).json({
        success: true,
        message: "Lead updated successfully",
        data: lead,
      });
    } catch (error: any) {
      if (error.message === "Lead not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (
        error.message.includes("already exists") ||
        error.message.includes("Invalid")
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error updating lead",
          error: error.message,
        });
      }
    }
  };

  // DELETE /api/leads/:id - Delete lead (soft delete)
  deleteLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
        return;
      }

      await this.leadService.deleteLead(id);
      res.status(200).json({
        success: true,
        message: "Lead deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Lead not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error deleting lead",
          error: error.message,
        });
      }
    }
  };

  // GET /api/leads/count - Get lead count
  getLeadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.leadService.getLeadCount();
      res.status(200).json({
        success: true,
        message: "Lead count retrieved successfully",
        count: count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving lead count",
        error: error.message,
      });
    }
  };

  // GET /api/leads/stage/:stageId/count - Get lead count by stage
  getLeadCountByStage = async (req: Request, res: Response): Promise<void> => {
    try {
      const stageId = parseInt(req.params.stageId);

      if (isNaN(stageId)) {
        res.status(400).json({
          success: false,
          message: "Invalid stage ID",
        });
        return;
      }

      const count = await this.leadService.getLeadCountByStage(stageId);
      res.status(200).json({
        success: true,
        message: "Lead count retrieved successfully",
        count: count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving lead count",
        error: error.message,
      });
    }
  };

  // POST /api/leads/bulk-import - Bulk import leads from Excel/CSV
  bulkImportLeads = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded. Please upload a CSV or Excel file.",
        });
        return;
      }

      // Get createdBy from authenticated user if available
      const createdBy =
        (req as any).user?.username || (req as any).user?.fullname || "system";

      // Optional: assign all imported leads to a specific user
      let assignedTo: number | undefined;
      const assignedToRaw = (req.body as any)?.assignedTo;
      if (assignedToRaw !== undefined) {
        const parsed = parseInt(String(assignedToRaw), 10);
        if (!isNaN(parsed)) {
          assignedTo = parsed;
        }
      }

      const result = await this.leadService.bulkImportLeads(
        file.path,
        file.originalname,
        createdBy,
        assignedTo
      );

      res.status(200).json({
        success: true,
        message: `Bulk import completed. ${result.success} leads imported successfully, ${result.failed} failed.`,
        data: {
          total: result.total,
          success: result.success,
          newRecords: result.newRecords,
          duplicates: result.duplicates,
          failed: result.failed,
          errors: result.errors,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error during bulk import",
        error: error.message,
      });
    }
  };

  // GET /api/leads/search - Search leads with cursor-based pagination
  searchLeads = async (req: Request, res: Response): Promise<void> => {
    try {
      const leadId =
        req.query.leadId !== undefined
          ? parseInt(req.query.leadId as string)
          : undefined;

      if (leadId !== undefined && (isNaN(leadId) || leadId <= 0)) {
        res.status(400).json({
          success: false,
          message: "Invalid leadId. It must be a positive number.",
        });
        return;
      }

      const leads = await this.leadService.searchLeadsWithCursor(leadId);

      res.status(200).json({
        success: true,
        message: "Leads retrieved successfully",
        data: leads,
        count: leads.length,
        cursor: leads.length > 0 ? leads[leads.length - 1].id : null,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error searching leads",
        error: error.message,
      });
    }
  };

  // GET /api/leads/payment-received - Get leads with 'PaymentReceived' stage
  getPaymentReceivedLeads = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Get pagination parameters from query string
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user?.id; // Get authenticated user ID

      const result = await this.leadService.getPaymentReceivedLeads(
        page,
        limit,
        userId
      );

      res.status(200).json({
        success: true,
        message: "PaymentReceived leads retrieved successfully",
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving PaymentReceived leads",
        error: error.message,
      });
    }
  };

  // GET /api/leads/countries - Get unique countries
  getUniqueCountries = async (req: Request, res: Response): Promise<void> => {
    try {
      const countries = await this.leadService.getUniqueCountries();
      res.status(200).json({
        success: true,
        message: "Countries retrieved successfully",
        data: countries,
        count: countries.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving countries",
        error: error.message,
      });
    }
  };

  // GET /api/leads/visa-categories - Get unique visa categories
  getUniqueVisaCategories = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const visaCategories = await this.leadService.getUniqueVisaCategories();
      res.status(200).json({
        success: true,
        message: "Visa categories retrieved successfully",
        data: visaCategories,
        count: visaCategories.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving visa categories",
        error: error.message,
      });
    }
  };

  // Meta Webhook: verification here; lead fetch/process delegated to LeadService
  metaWebhook = async (req: Request, res: Response): Promise<void> => {
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
      if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
        res.status(200).send(challenge);
        return;
      }
      res.status(403).send("Forbidden");
      return;
    }

    try {
      const body = req.body;
      if (body.object === "page") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === "leadgen" && change.value?.leadgen_id) {
              this.leadService
                .fetchAndProcessMetaLead(change.value.leadgen_id)
                .catch((err) => console.error("Error in lead processing:", err));
            }
          }
        }
      }
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  };
   /**
   * Webhook for receiving leads from an external website (e.g. WordPress, Elementor, CF7)
   * POST /api/leads/website
   */
  websiteWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;

      // Log incoming lead for debugging
      console.log(`[Website Webhook] Received lead from form: ${data.form_name || "Unknown Form"}`);

      // Basic validation
      if (!data || Object.keys(data).length === 0) {
        res.status(400).json({
          success: false,
          message: "Empty data received",
        });
        return;
      }

      const lead = await this.leadService.processWebsiteLead(data);

      res.status(201).json({
        success: true,
        message: "Lead received and processed successfully",
        data: {
          leadId: lead.id,
          fullname: lead.fullname,
          email: lead.email
        },
      });
    } catch (error: any) {
      console.error("[Website Webhook] Error:", error);
      res.status(500).json({
        success: false,
        message: "Error processing lead",
        error: error.message,
      });
    }
  };
}
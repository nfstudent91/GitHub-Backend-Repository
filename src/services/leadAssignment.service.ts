import { LeadAssignmentRepository } from "../repositories/leadAssignment.repository";
import { LeadAssignment } from "../entities/LeadAssignment";
import { LeadRepository } from "../repositories/lead.repository";
import { UserRepository } from "../repositories/user.repository";
import { LeadHistoryRepository } from "../repositories/leadHistory.repository";

export class LeadAssignmentService {
  private leadAssignmentRepository: LeadAssignmentRepository;
  private leadRepository: LeadRepository;
  private userRepository: UserRepository;
  private leadHistoryRepository: LeadHistoryRepository;

  constructor() {
    this.leadAssignmentRepository = new LeadAssignmentRepository();
    this.leadRepository = new LeadRepository();
    this.userRepository = new UserRepository();
    this.leadHistoryRepository = new LeadHistoryRepository();
  }

  async getAllAssignments(): Promise<LeadAssignment[]> {
    return await this.leadAssignmentRepository.findAll();
  }

  async getAssignmentById(id: number): Promise<LeadAssignment | null> {
    const assignment = await this.leadAssignmentRepository.findById(id);
    if (!assignment) {
      throw new Error("Lead assignment not found");
    }
    return assignment;
  }

  async getAssignmentsByLeadId(leadId: number): Promise<LeadAssignment[]> {
    // Verify lead exists
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    return await this.leadAssignmentRepository.findByLeadId(leadId);
  }

  async getAssignmentsByAssignedTo(userId: number): Promise<LeadAssignment[]> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return await this.leadAssignmentRepository.findByAssignedTo(userId);
  }

  async getCurrentAssignment(leadId: number): Promise<LeadAssignment | null> {
    return await this.leadAssignmentRepository.findCurrentAssignment(leadId);
  }

  async createAssignment(assignmentData: Partial<LeadAssignment>): Promise<LeadAssignment> {
    // Validate required fields
    if (!assignmentData.leadId) {
      throw new Error("Lead ID is required");
    }
    if (!assignmentData.assignedTo) {
      throw new Error("Assigned to user ID is required");
    }
    if (!assignmentData.assignedBy) {
      throw new Error("Assigned by user ID is required");
    }

    // Verify lead exists
    const lead = await this.leadRepository.findById(assignmentData.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify assigned to user exists
    const assignedToUser = await this.userRepository.findById(assignmentData.assignedTo);
    if (!assignedToUser) {
      throw new Error("Assigned to user not found");
    }

    // Verify assigned by user exists
    const assignedByUser = await this.userRepository.findById(assignmentData.assignedBy);
    if (!assignedByUser) {
      throw new Error("Assigned by user not found");
    }

    // Create assignment
    // Note: Database trigger automatically creates history record
    const assignment = await this.leadAssignmentRepository.create(assignmentData);

    return assignment;
  }

  async updateAssignment(id: number, assignmentData: Partial<LeadAssignment>): Promise<LeadAssignment | null> {
    // Check if assignment exists
    const existingAssignment = await this.leadAssignmentRepository.findById(id);
    if (!existingAssignment) {
      throw new Error("Lead assignment not found");
    }

    // If updating assigned to, verify user exists
    if (assignmentData.assignedTo !== undefined) {
      const user = await this.userRepository.findById(assignmentData.assignedTo);
      if (!user) {
        throw new Error("Assigned to user not found");
      }
    }

    // If updating assigned by, verify user exists
    if (assignmentData.assignedBy !== undefined) {
      const user = await this.userRepository.findById(assignmentData.assignedBy);
      if (!user) {
        throw new Error("Assigned by user not found");
      }
    }

    // If updating lead, verify lead exists
    if (assignmentData.leadId !== undefined) {
      const lead = await this.leadRepository.findById(assignmentData.leadId);
      if (!lead) {
        throw new Error("Lead not found");
      }
    }

    // Don't update createdAt - preserve original creation timestamp
    return await this.leadAssignmentRepository.update(id, assignmentData);
  }

  async deleteAssignment(id: number): Promise<boolean> {
    // Check if assignment exists
    const existingAssignment = await this.leadAssignmentRepository.findById(id);
    if (!existingAssignment) {
      throw new Error("Lead assignment not found");
    }

    return await this.leadAssignmentRepository.delete(id);
  }

  async getAssignmentCount(): Promise<number> {
    return await this.leadAssignmentRepository.count();
  }

  async getAssignmentCountByAssignedTo(userId: number): Promise<number> {
    return await this.leadAssignmentRepository.countByAssignedTo(userId);
  }

  async upsertAssignment(assignmentData: Partial<LeadAssignment>): Promise<{ assignment: LeadAssignment; isUpdate: boolean }> {
    // Validate required fields
    if (!assignmentData.leadId) {
      throw new Error("Lead ID is required");
    }
    if (!assignmentData.assignedTo) {
      throw new Error("Assigned to user ID is required");
    }
    if (!assignmentData.assignedBy) {
      throw new Error("Assigned by user ID is required");
    }

    // Verify lead exists
    const lead = await this.leadRepository.findById(assignmentData.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify assigned to user exists
    const assignedToUser = await this.userRepository.findById(assignmentData.assignedTo);
    if (!assignedToUser) {
      throw new Error("Assigned to user not found");
    }

    // Verify assigned by user exists
    const assignedByUser = await this.userRepository.findById(assignmentData.assignedBy);
    if (!assignedByUser) {
      throw new Error("Assigned by user not found");
    }

    // Check if assignment already exists for this lead
    const existingAssignment = await this.leadAssignmentRepository.findCurrentAssignment(assignmentData.leadId);

    let assignment: LeadAssignment;
    let isUpdate = false;

    if (existingAssignment) {
      // Update existing assignment
      isUpdate = true;
      const updateData: Partial<LeadAssignment> = {
        assignedTo: assignmentData.assignedTo,
        assignedBy: assignmentData.assignedBy,
        remarks: assignmentData.remarks,
        canAccessPreviousLogs: assignmentData.canAccessPreviousLogs,
        // Note: Don't update createdAt - preserve original creation timestamp
      };

      // Only update createdBy if provided
      if (assignmentData.createdBy) {
        updateData.createdBy = assignmentData.createdBy;
      }

      const updated = await this.leadAssignmentRepository.update(existingAssignment.id, updateData);
      if (!updated) {
        throw new Error("Failed to update assignment");
      }
      assignment = updated;
    } else {
      // Create new assignment
      assignment = await this.leadAssignmentRepository.create(assignmentData);
    }

    // Note: Database triggers automatically create history records for both insert and update

    return { assignment, isUpdate };
  }
}


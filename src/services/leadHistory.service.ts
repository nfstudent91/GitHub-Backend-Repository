import { LeadHistoryRepository } from "../repositories/leadHistory.repository";
import { LeadHistory } from "../entities/LeadHistory";
import { LeadRepository } from "../repositories/lead.repository";
import { UserRepository } from "../repositories/user.repository";

export class LeadHistoryService {
  private leadHistoryRepository: LeadHistoryRepository;
  private leadRepository: LeadRepository;
  private userRepository: UserRepository;

  constructor() {
    this.leadHistoryRepository = new LeadHistoryRepository();
    this.leadRepository = new LeadRepository();
    this.userRepository = new UserRepository();
  }

  async getAllHistories(): Promise<LeadHistory[]> {
    return await this.leadHistoryRepository.findAll();
  }

  async getHistoryById(id: number): Promise<LeadHistory | null> {
    const history = await this.leadHistoryRepository.findById(id);
    if (!history) {
      throw new Error("Lead history not found");
    }
    return history;
  }

  async getHistoriesByLeadId(leadId: number): Promise<LeadHistory[]> {
    // Verify lead exists
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    return await this.leadHistoryRepository.findByLeadId(leadId);
  }

  async getHistoriesByAssignedTo(userId: number): Promise<LeadHistory[]> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return await this.leadHistoryRepository.findByAssignedTo(userId);
  }

  async getHistoriesByAssignedBy(userId: number): Promise<LeadHistory[]> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return await this.leadHistoryRepository.findByAssignedBy(userId);
  }

  async createHistory(historyData: Partial<LeadHistory>): Promise<LeadHistory> {
    // Validate required fields
    if (!historyData.leadId) {
      throw new Error("Lead ID is required");
    }
    if (!historyData.assignedTo) {
      throw new Error("Assigned to user ID is required");
    }
    if (!historyData.assignedBy) {
      throw new Error("Assigned by user ID is required");
    }

    // Verify lead exists
    const lead = await this.leadRepository.findById(historyData.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify assigned to user exists
    const assignedToUser = await this.userRepository.findById(historyData.assignedTo);
    if (!assignedToUser) {
      throw new Error("Assigned to user not found");
    }

    // Verify assigned by user exists
    const assignedByUser = await this.userRepository.findById(historyData.assignedBy);
    if (!assignedByUser) {
      throw new Error("Assigned by user not found");
    }

    return await this.leadHistoryRepository.create(historyData);
  }

  async updateHistory(id: number, historyData: Partial<LeadHistory>): Promise<LeadHistory | null> {
    // Check if history exists
    const existingHistory = await this.leadHistoryRepository.findById(id);
    if (!existingHistory) {
      throw new Error("Lead history not found");
    }

    // If updating assigned to, verify user exists
    if (historyData.assignedTo) {
      const user = await this.userRepository.findById(historyData.assignedTo);
      if (!user) {
        throw new Error("Assigned to user not found");
      }
    }

    // If updating assigned by, verify user exists
    if (historyData.assignedBy) {
      const user = await this.userRepository.findById(historyData.assignedBy);
      if (!user) {
        throw new Error("Assigned by user not found");
      }
    }

    // If updating lead, verify lead exists
    if (historyData.leadId) {
      const lead = await this.leadRepository.findById(historyData.leadId);
      if (!lead) {
        throw new Error("Lead not found");
      }
    }

    return await this.leadHistoryRepository.update(id, historyData);
  }

  async deleteHistory(id: number): Promise<boolean> {
    // Check if history exists
    const existingHistory = await this.leadHistoryRepository.findById(id);
    if (!existingHistory) {
      throw new Error("Lead history not found");
    }

    return await this.leadHistoryRepository.delete(id);
  }

  async getHistoryCount(): Promise<number> {
    return await this.leadHistoryRepository.count();
  }

  async getHistoryCountByLeadId(leadId: number): Promise<number> {
    return await this.leadHistoryRepository.countByLeadId(leadId);
  }
}


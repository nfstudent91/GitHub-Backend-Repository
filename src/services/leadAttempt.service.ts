import { LeadAttemptRepository } from "../repositories/leadAttempt.repository";
import { LeadAttempt } from "../entities/LeadAttempt";
import { LeadRepository } from "../repositories/lead.repository";
import { FollowUpRepository } from "../repositories/followUp.repository";
import { LeadReminderRepository } from "../repositories/leadReminder.repository";
import { LeadReminder, ReminderStatus, ReminderType } from "../entities/LeadReminder";

export class LeadAttemptService {
  private leadAttemptRepository: LeadAttemptRepository;
  private leadRepository: LeadRepository;
  private followUpRepository: FollowUpRepository;
  private leadReminderRepository: LeadReminderRepository;

  constructor() {
    this.leadAttemptRepository = new LeadAttemptRepository();
    this.leadRepository = new LeadRepository();
    this.followUpRepository = new FollowUpRepository();
    this.leadReminderRepository = new LeadReminderRepository();
  }

  async getAllAttempts(): Promise<LeadAttempt[]> {
    return await this.leadAttemptRepository.findAll();
  }

  async getAttemptById(id: number): Promise<LeadAttempt | null> {
    const attempt = await this.leadAttemptRepository.findById(id);
    if (!attempt) {
      throw new Error("Lead attempt not found");
    }
    return attempt;
  }

  async getAttemptsByLeadId(leadId: number): Promise<{
    data: LeadAttempt[];
    callStatistics: {
      total: number;
      answered: number;
      notAnswered: number;
    };
  }> {
    // Verify lead exists
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Get attempts and call statistics in parallel
    const [data, callStatistics] = await Promise.all([
      this.leadAttemptRepository.findByLeadId(leadId),
      this.leadAttemptRepository.getCallStatisticsByLeadId(leadId),
    ]);

    return { data, callStatistics };
  }

  async getAttemptsByFollowTypeId(followTypeId: number): Promise<LeadAttempt[]> {
    // Verify follow-up type exists
    const followUp = await this.followUpRepository.findById(followTypeId);
    if (!followUp) {
      throw new Error("Follow-up type not found");
    }
    return await this.leadAttemptRepository.findByFollowTypeId(followTypeId);
  }

  async createAttempt(attemptData: Partial<LeadAttempt>): Promise<LeadAttempt> {
    // Validate required fields
    if (!attemptData.leadId) {
      throw new Error("Lead ID is required");
    }
    if (!attemptData.followTypeId) {
      throw new Error("Follow-up type ID is required");
    }

    // Verify lead exists
    const lead = await this.leadRepository.findById(attemptData.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify follow-up type exists
    const followUp = await this.followUpRepository.findById(attemptData.followTypeId);
    if (!followUp) {
      throw new Error("Follow-up type not found");
    }

    // Create the lead attempt
    const attempt = await this.leadAttemptRepository.create(attemptData);

    // If scheduledTime is set, create a lead reminder
    if (attemptData.scheduledTime) {
      // Get assigned user from lead's assignments, default to user 1 if none
      const assignedUserId = lead.assignments && lead.assignments.length > 0
        ? lead.assignments[lead.assignments.length - 1].assignedTo
        : 1;

      const reminderData: Partial<LeadReminder> = {
        leadId: attemptData.leadId,
        userId: assignedUserId,
        title: `Scheduled Call - ${followUp.name}`,
        description: attemptData.remarks || `Follow-up call scheduled`,
        reminderDateTime: attemptData.scheduledTime,
        status: ReminderStatus.PENDING,
        type: ReminderType.NOTIFICATION,
        createdBy: attemptData.createdBy,
      };
      await this.leadReminderRepository.create(reminderData);
    }

    return attempt;
  }

  async updateAttempt(id: number, attemptData: Partial<LeadAttempt>): Promise<LeadAttempt | null> {
    // Check if attempt exists
    const existingAttempt = await this.leadAttemptRepository.findById(id);
    if (!existingAttempt) {
      throw new Error("Lead attempt not found");
    }

    // If updating lead, verify lead exists
    if (attemptData.leadId) {
      const lead = await this.leadRepository.findById(attemptData.leadId);
      if (!lead) {
        throw new Error("Lead not found");
      }
    }

    // If updating follow-up type, verify it exists
    if (attemptData.followTypeId) {
      const followUp = await this.followUpRepository.findById(attemptData.followTypeId);
      if (!followUp) {
        throw new Error("Follow-up type not found");
      }
    }

    return await this.leadAttemptRepository.update(id, attemptData);
  }

  async deleteAttempt(id: number): Promise<boolean> {
    // Check if attempt exists
    const existingAttempt = await this.leadAttemptRepository.findById(id);
    if (!existingAttempt) {
      throw new Error("Lead attempt not found");
    }

    return await this.leadAttemptRepository.delete(id);
  }

  async getAttemptCount(): Promise<number> {
    return await this.leadAttemptRepository.count();
  }

  async getAttemptCountByLeadId(leadId: number): Promise<number> {
    return await this.leadAttemptRepository.countByLeadId(leadId);
  }

  async getDashboardStats(): Promise<{
    callStatistics: {
      total: number;
      answered: number;
      notAnswered: number;
      pending: number;
    };
    priorityCalls: LeadAttempt[];
    upcomingCalls: LeadAttempt[];
    recentCallLogs: LeadAttempt[];
  }> {
    // Get all dashboard data in parallel
    const [callStatistics, priorityCalls, upcomingCalls, recentCallLogs] = await Promise.all([
      this.leadAttemptRepository.getCallStatistics(),
      this.leadAttemptRepository.getPriorityCalls(10),
      this.leadAttemptRepository.getUpcomingCalls(10),
      this.leadAttemptRepository.getRecentCallLogs(20),
    ]);

    return {
      callStatistics,
      priorityCalls,
      upcomingCalls,
      recentCallLogs,
    };
  }
}


import { LeadReminderRepository } from "../repositories/leadReminder.repository";
import { LeadReminder, ReminderStatus } from "../entities/LeadReminder";
import { LeadRepository } from "../repositories/lead.repository";
import { UserRepository } from "../repositories/user.repository";

export class LeadReminderService {
    private leadReminderRepository: LeadReminderRepository;
    private leadRepository: LeadRepository;
    private userRepository: UserRepository;

    constructor() {
        this.leadReminderRepository = new LeadReminderRepository();
        this.leadRepository = new LeadRepository();
        this.userRepository = new UserRepository();
    }

    async getAllReminders(): Promise<LeadReminder[]> {
        return await this.leadReminderRepository.findAll();
    }

    async getReminderById(id: number): Promise<LeadReminder | null> {
        const reminder = await this.leadReminderRepository.findById(id);
        if (!reminder) {
            throw new Error("Reminder not found");
        }
        return reminder;
    }

    async getRemindersByLeadId(leadId: number): Promise<LeadReminder[]> {
        // Verify lead exists
        const lead = await this.leadRepository.findById(leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }
        return await this.leadReminderRepository.findByLeadId(leadId);
    }

    async getRemindersByUserId(userId: number): Promise<LeadReminder[]> {
        // Verify user exists
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return await this.leadReminderRepository.findByUserId(userId);
    }

    async getRemindersByStatus(status: ReminderStatus): Promise<LeadReminder[]> {
        return await this.leadReminderRepository.findByStatus(status);
    }

    async getPendingReminders(): Promise<LeadReminder[]> {
        return await this.leadReminderRepository.findPendingReminders();
    }

    async getUpcomingReminders(userId?: number): Promise<LeadReminder[]> {
        if (userId) {
            // Verify user exists
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
        }
        return await this.leadReminderRepository.findUpcomingReminders(userId);
    }

    async getOverdueReminders(userId?: number): Promise<LeadReminder[]> {
        if (userId) {
            // Verify user exists
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
        }
        return await this.leadReminderRepository.findOverdueReminders(userId);
    }

    async createReminder(
        reminderData: Partial<LeadReminder>
    ): Promise<LeadReminder> {
        // Validate required fields
        if (!reminderData.leadId) {
            throw new Error("Lead ID is required");
        }
        if (!reminderData.userId) {
            throw new Error("User ID is required");
        }
        if (!reminderData.title) {
            throw new Error("Title is required");
        }
        if (!reminderData.reminderDateTime) {
            throw new Error("Reminder date and time is required");
        }

        // Verify lead exists
        const lead = await this.leadRepository.findById(reminderData.leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        // Verify user exists
        const user = await this.userRepository.findById(reminderData.userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Validate reminder date is in the future
        const reminderDate = new Date(reminderData.reminderDateTime);
        if (reminderDate < new Date()) {
            throw new Error("Reminder date must be in the future");
        }

        return await this.leadReminderRepository.create(reminderData);
    }

    async updateReminder(
        id: number,
        reminderData: Partial<LeadReminder>
    ): Promise<LeadReminder | null> {
        // Check if reminder exists
        const existingReminder = await this.leadReminderRepository.findById(id);
        if (!existingReminder) {
            throw new Error("Reminder not found");
        }

        // If updating lead, verify lead exists
        if (reminderData.leadId) {
            const lead = await this.leadRepository.findById(reminderData.leadId);
            if (!lead) {
                throw new Error("Lead not found");
            }
        }

        // If updating user, verify user exists
        if (reminderData.userId) {
            const user = await this.userRepository.findById(reminderData.userId);
            if (!user) {
                throw new Error("User not found");
            }
        }

        // Validate reminder date if being updated
        if (reminderData.reminderDateTime) {
            const reminderDate = new Date(reminderData.reminderDateTime);
            if (
                reminderDate < new Date() &&
                existingReminder.status === ReminderStatus.PENDING
            ) {
                throw new Error(
                    "Reminder date must be in the future for pending reminders"
                );
            }
        }

        return await this.leadReminderRepository.update(id, reminderData);
    }

    async deleteReminder(id: number): Promise<boolean> {
        // Check if reminder exists
        const existingReminder = await this.leadReminderRepository.findById(id);
        if (!existingReminder) {
            throw new Error("Reminder not found");
        }

        return await this.leadReminderRepository.delete(id);
    }

    async markAsCompleted(id: number): Promise<LeadReminder | null> {
        return await this.updateReminder(id, { status: ReminderStatus.COMPLETED });
    }

    async markAsDismissed(id: number): Promise<LeadReminder | null> {
        return await this.updateReminder(id, { status: ReminderStatus.DISMISSED });
    }

    async getReminderCount(): Promise<number> {
        return await this.leadReminderRepository.count();
    }

    async getReminderCountByLeadId(leadId: number): Promise<number> {
        return await this.leadReminderRepository.countByLeadId(leadId);
    }

    async getReminderCountByUserId(userId: number): Promise<number> {
        return await this.leadReminderRepository.countByUserId(userId);
    }

    async getReminderCountByStatus(status: ReminderStatus): Promise<number> {
        return await this.leadReminderRepository.countByStatus(status);
    }
}

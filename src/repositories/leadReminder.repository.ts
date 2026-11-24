import { Repository, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../config/database";
import { LeadReminder, ReminderStatus } from "../entities/LeadReminder";

export class LeadReminderRepository {
    private repository: Repository<LeadReminder>;

    constructor() {
        this.repository = AppDataSource.getRepository(LeadReminder);
    }

    async findAll(): Promise<LeadReminder[]> {
        return await this.repository.find({
            relations: ["lead", "lead.stage", "user"],
            order: { reminderDateTime: "ASC" },
        });
    }

    async findById(id: number): Promise<LeadReminder | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ["lead", "lead.stage", "user"],
        });
    }

    async findByLeadId(leadId: number): Promise<LeadReminder[]> {
        return await this.repository.find({
            where: { leadId },
            relations: ["lead", "user"],
            order: { reminderDateTime: "ASC" },
        });
    }

    async findByUserId(userId: number): Promise<LeadReminder[]> {
        return await this.repository.find({
            where: { userId },
            relations: ["lead", "lead.stage", "user"],
            order: { reminderDateTime: "ASC" },
        });
    }

    async findByStatus(status: ReminderStatus): Promise<LeadReminder[]> {
        return await this.repository.find({
            where: { status },
            relations: ["lead", "lead.stage", "user"],
            order: { reminderDateTime: "ASC" },
        });
    }

    async findPendingReminders(): Promise<LeadReminder[]> {
        return await this.repository.find({
            where: { status: ReminderStatus.PENDING },
            relations: ["lead", "lead.stage", "user"],
            order: { reminderDateTime: "ASC" },
        });
    }

    async findUpcomingReminders(userId?: number): Promise<LeadReminder[]> {
        const now = new Date();
        const queryBuilder = this.repository
            .createQueryBuilder("reminder")
            .leftJoinAndSelect("reminder.lead", "lead")
            .leftJoinAndSelect("lead.stage", "stage")
            .leftJoinAndSelect("reminder.user", "user")
            .where("reminder.status = :status", { status: ReminderStatus.PENDING })
            .andWhere("reminder.reminderDateTime >= :now", { now });

        if (userId) {
            queryBuilder.andWhere("reminder.userId = :userId", { userId });
        }

        return await queryBuilder
            .orderBy("reminder.reminderDateTime", "ASC")
            .getMany();
    }

    async findOverdueReminders(userId?: number): Promise<LeadReminder[]> {
        const now = new Date();
        const queryBuilder = this.repository
            .createQueryBuilder("reminder")
            .leftJoinAndSelect("reminder.lead", "lead")
            .leftJoinAndSelect("lead.stage", "stage")
            .leftJoinAndSelect("reminder.user", "user")
            .where("reminder.status = :status", { status: ReminderStatus.PENDING })
            .andWhere("reminder.reminderDateTime < :now", { now });

        if (userId) {
            queryBuilder.andWhere("reminder.userId = :userId", { userId });
        }

        return await queryBuilder
            .orderBy("reminder.reminderDateTime", "ASC")
            .getMany();
    }

    async create(reminderData: Partial<LeadReminder>): Promise<LeadReminder> {
        const reminder = this.repository.create(reminderData);
        return await this.repository.save(reminder);
    }

    async update(
        id: number,
        reminderData: Partial<LeadReminder>
    ): Promise<LeadReminder | null> {
        await this.repository.update(id, reminderData);
        return await this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async count(): Promise<number> {
        return await this.repository.count();
    }

    async countByLeadId(leadId: number): Promise<number> {
        return await this.repository.count({ where: { leadId } });
    }

    async countByUserId(userId: number): Promise<number> {
        return await this.repository.count({ where: { userId } });
    }

    async countByStatus(status: ReminderStatus): Promise<number> {
        return await this.repository.count({ where: { status } });
    }

    async countPendingRemindersByUserId(userId: number): Promise<number> {
        return await this.repository.count({
            where: {
                userId,
                status: ReminderStatus.PENDING
            }
        });
    }

    async findRecentCompletedRemindersByUserId(userId: number, limit: number = 10): Promise<LeadReminder[]> {
        return await this.repository.find({
            where: {
                userId,
                status: ReminderStatus.COMPLETED
            },
            relations: ["lead", "lead.stage", "user"],
            order: { updatedAt: "DESC" }, // Use updatedAt for completion time approximation
            take: limit
        });
    }

    async countRemindersInRange(start: Date, end: Date): Promise<number> {
        return await this.repository.createQueryBuilder("reminder")
            .innerJoin("reminder.lead", "lead")
            .where("lead.isActive = :isActive", { isActive: true })
            .andWhere("reminder.reminderDateTime >= :start", { start })
            .andWhere("reminder.reminderDateTime <= :end", { end })
            .getCount();
    }

    async countCompletedRemindersByUserIdAndDate(userId: number, fromDate: Date, toDate: Date): Promise<number> {
        return await this.repository.createQueryBuilder("reminder")
            .innerJoin("reminder.lead", "lead")
            .where("reminder.userId = :userId", { userId })
            .andWhere("lead.isActive = :isActive", { isActive: true })
            .andWhere("reminder.status = :status", { status: ReminderStatus.COMPLETED })
            .andWhere("reminder.updatedAt >= :fromDate", { fromDate })
            .andWhere("reminder.updatedAt <= :toDate", { toDate })
            .getCount();
    }
}

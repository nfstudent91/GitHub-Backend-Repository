import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { LeadAttempt } from "../entities/LeadAttempt";

export class LeadAttemptRepository {
  private repository: Repository<LeadAttempt>;

  constructor() {
    this.repository = AppDataSource.getRepository(LeadAttempt);
  }

  async findAll(): Promise<LeadAttempt[]> {
    return await this.repository.find({
      relations: ["lead", "followType"],
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: number): Promise<LeadAttempt | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["lead", "lead.stage", "followType"],
    });
  }

  async findByLeadId(leadId: number): Promise<LeadAttempt[]> {
    return await this.repository.find({
      where: { leadId },
      relations: ["lead", "followType"],
      order: { createdAt: "DESC" },
    });
  }

  async findByFollowTypeId(followTypeId: number): Promise<LeadAttempt[]> {
    return await this.repository.find({
      where: { followTypeId },
      relations: ["lead", "followType"],
      order: { createdAt: "DESC" },
    });
  }

  async create(attemptData: Partial<LeadAttempt>): Promise<LeadAttempt> {
    const attempt = this.repository.create(attemptData);
    return await this.repository.save(attempt);
  }

  async update(id: number, attemptData: Partial<LeadAttempt>): Promise<LeadAttempt | null> {
    await this.repository.update(id, attemptData);
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

  async getCallStatistics(): Promise<{
    total: number;
    answered: number;
    notAnswered: number;
    pending: number;
  }> {
    const total = await this.repository.count();

    // Count answered: leads that have at least one attempt record (been called)
    const answered = await this.repository.manager
      .getRepository("Lead")
      .createQueryBuilder("lead")
      .innerJoin("lead.attempts", "attempt")
      .select("COUNT(DISTINCT lead.id)", "count")
      .getRawOne()
      .then(result => parseInt(result.count) || 0);

    // Count not answered: leads that have NO attempt records (not called yet)
    const notAnswered = await this.repository.manager
      .getRepository("Lead")
      .createQueryBuilder("lead")
      .leftJoin("lead.attempts", "attempt")
      .where("attempt.id IS NULL")
      .getCount();

    // Count pending calls (followType.name = 'Callback', 'Follow-up', 'Pending', 'Scheduled')
    const pending = await this.repository
      .createQueryBuilder("attempt")
      .leftJoin("attempt.followType", "followType")
      .where("LOWER(followType.name) IN (:...names)", {
        names: ["callback", "follow-up", "pending", "scheduled", "reschedule"],
      })
      .getCount();

    return { total, answered, notAnswered, pending };
  }

  async getPriorityCalls(limit: number = 10): Promise<LeadAttempt[]> {
    // Get calls where lead status is "Follow Up"
    return await this.repository
      .createQueryBuilder("attempt")
      .leftJoinAndSelect("attempt.lead", "lead")
      .leftJoinAndSelect("lead.stage", "stage")
      .leftJoinAndSelect("attempt.followType", "followType")
      .where("lead.status = :status", {
        status: "Follow Up",
      })
      .orderBy("attempt.createdAt", "DESC")
      .limit(limit)
      .getMany();
  }

  async getUpcomingCalls(limit: number = 10): Promise<LeadAttempt[]> {
    // Get calls where lead status is "Meeting Scheduled"
    return await this.repository
      .createQueryBuilder("attempt")
      .leftJoinAndSelect("attempt.lead", "lead")
      .leftJoinAndSelect("lead.stage", "stage")
      .leftJoinAndSelect("attempt.followType", "followType")
      .where("lead.status = :status", {
        status: "Meeting Scheduled",
      })
      .orderBy("attempt.createdAt", "ASC")
      .limit(limit)
      .getMany();
  }

  async getRecentCallLogs(limit: number = 20): Promise<LeadAttempt[]> {
    // Get recent call attempts with all details
    return await this.repository
      .createQueryBuilder("attempt")
      .leftJoinAndSelect("attempt.lead", "lead")
      .leftJoinAndSelect("attempt.followType", "followType")
      .orderBy("attempt.createdAt", "DESC")
      .limit(limit)
      .getMany();
  }

  async getCallStatisticsByLeadId(leadId: number): Promise<{
    total: number;
    answered: number;
    notAnswered: number;
  }> {
    const total = await this.repository.count({ where: { leadId } });

    // Count answered calls: attempts where followType is NOT "Not Answered"
    const answered = await this.repository
      .createQueryBuilder("attempt")
      .leftJoin("attempt.followType", "followType")
      .where("attempt.leadId = :leadId", { leadId })
      .andWhere("LOWER(followType.name) != :name", { name: "not answered" })
      .getCount();

    // Count not answered calls: attempts where followType is "Not Answered"
    const notAnswered = await this.repository
      .createQueryBuilder("attempt")
      .leftJoin("attempt.followType", "followType")
      .where("attempt.leadId = :leadId", { leadId })
      .andWhere("LOWER(followType.name) = :name", { name: "not answered" })
      .getCount();

    return { total, answered, notAnswered };
  }

  async countAttemptsByUserId(userId: number): Promise<number> {
    return await this.repository.createQueryBuilder("attempt")
      .leftJoin("attempt.lead", "lead")
      .leftJoin("lead.assignments", "assignments")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("assignments.assignedTo = :userId", { userId })
      .getCount();
  }

  async findRecentAttemptsByUserId(userId: number, limit: number = 10): Promise<LeadAttempt[]> {
    return await this.repository.createQueryBuilder("attempt")
      .leftJoinAndSelect("attempt.lead", "lead")
      .leftJoinAndSelect("attempt.followType", "followType")
      .leftJoin("lead.assignments", "assignments")
      .where("assignments.assignedTo = :userId", { userId })
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .orderBy("attempt.createdAt", "DESC")
      .limit(limit)
      .getMany();
  }

  async countCallsByUserIdAndDate(userId: number, fromDate: Date, toDate: Date): Promise<number> {
    return await this.repository.createQueryBuilder("attempt")
      .leftJoin("attempt.lead", "lead")
      .leftJoin("lead.assignments", "assignments")
      .where("assignments.assignedTo = :userId", { userId })
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .andWhere("attempt.createdAt >= :fromDate", { fromDate })
      .andWhere("attempt.createdAt <= :toDate", { toDate })
      .getCount();
  }

  async getOutcomeDistributionByUserIdAndDate(userId: number, fromDate: Date, toDate: Date): Promise<{ outcome: string; count: number }[]> {
    const result = await this.repository.createQueryBuilder("attempt")
      .leftJoin("attempt.lead", "lead")
      .leftJoin("lead.assignments", "assignments")
      .select("attempt.outcome", "outcome")
      .addSelect("COUNT(attempt.id)", "count")
      .where("assignments.assignedTo = :userId", { userId })
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .andWhere("attempt.createdAt >= :fromDate", { fromDate })
      .andWhere("attempt.createdAt <= :toDate", { toDate })
      .groupBy("attempt.outcome")
      .getRawMany();

    return result.map(r => ({
      outcome: r.outcome || "Unknown",
      count: parseInt(r.count)
    }));
  }

  async getWeeklyCallVolumeByUserId(userId: number): Promise<{ date: string; count: number }[]> {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const result = await this.repository.createQueryBuilder("attempt")
      .leftJoin("attempt.lead", "lead")
      .leftJoin("lead.assignments", "assignments")
      .select("DATE(attempt.createdAt)", "date")
      .addSelect("COUNT(attempt.id)", "count")
      .where("assignments.assignedTo = :userId", { userId })
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .andWhere("attempt.createdAt >= :fromDate", { fromDate: sevenDaysAgo })
      .groupBy("DATE(attempt.createdAt)")
      .orderBy("date", "ASC")
      .getRawMany();

    return result.map(r => ({
      date: typeof r.date === 'string' ? r.date : new Date(r.date).toISOString().split('T')[0],
      count: parseInt(r.count)
    }));
  }

  async countAttemptsInRange(start: Date, end: Date): Promise<number> {
    return await this.repository.createQueryBuilder("attempt")
      .innerJoin("attempt.lead", "lead")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("attempt.createdAt >= :start", { start })
      .andWhere("attempt.createdAt <= :end", { end })
      .getCount();
  }

  async getInteractionCountsByUserIdAndDate(userId: number, fromDate: Date, toDate: Date): Promise<{ [key: string]: number }> {
    const result = await this.repository.createQueryBuilder("attempt")
      .leftJoin("attempt.lead", "lead")
      .leftJoin("lead.assignments", "assignments")
      .leftJoin("attempt.followType", "followType")
      .select("LOWER(followType.name)", "type")
      .addSelect("COUNT(attempt.id)", "count")
      .where("assignments.assignedTo = :userId", { userId })
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .andWhere("attempt.createdAt >= :fromDate", { fromDate })
      .andWhere("attempt.createdAt <= :toDate", { toDate })
      .groupBy("LOWER(followType.name)")
      .getRawMany();

    const counts: { [key: string]: number } = {};
    result.forEach(r => {
      counts[r.type] = parseInt(r.count);
    });
    return counts;
  }
}


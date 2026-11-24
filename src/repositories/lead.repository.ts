import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Lead, LeadStatus } from "../entities/Lead";

export class LeadRepository {
  private repository: Repository<Lead>;

  constructor() {
    this.repository = AppDataSource.getRepository(Lead);
  }

  async findAll(): Promise<Lead[]> {
    return await this.repository.find({
      where: { isActive: true },
      relations: [
        "stage",
        "assignments",
        "assignments.assignedToUser",
        "assignments.assignedByUser",
        "histories",
        "histories.assignedToUser",
        "histories.assignedByUser",
        "attempts",
        "attempts.followType",
      ],
      order: { createdAt: "DESC" },
    });
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    stageId?: number,
    search?: string,
    status?: string,
    userId?: number,
    includeStatuses?: string[],
    visaCategory?: string,
    country?: string,
    date?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<{ data: Lead[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    // Build query builder for search functionality
    const queryBuilder = this.repository.createQueryBuilder("lead")
      .leftJoinAndSelect("lead.stage", "stage")
      .leftJoinAndSelect("lead.assignments", "assignments")
      .leftJoinAndSelect("assignments.assignedToUser", "assignmentAssignedToUser")
      .leftJoinAndSelect("assignments.assignedByUser", "assignmentAssignedByUser")
      .leftJoinAndSelect("lead.metaForm", "metaForm")
      // .leftJoinAndSelect("lead.reminders", "reminders")
      // .leftJoinAndSelect("lead.histories", "histories")
      // .leftJoinAndSelect("histories.assignedToUser", "historyAssignedToUser")
      // .leftJoinAndSelect("histories.assignedByUser", "historyAssignedByUser")
      // .leftJoinAndSelect("lead.attempts", "attempts")
      // .leftJoinAndSelect("attempts.followType", "attemptFollowType")
      .where("lead.isActive = :isActive", { isActive: true });

    // Add userId filter if provided
    if (userId !== undefined && userId !== null) {
      queryBuilder.andWhere("assignments.assignedTo = :userId", { userId });
    }

    // Add stageId filter if provided
    if (stageId !== undefined && stageId !== null) {
      if (includeStatuses && includeStatuses.length > 0) {
        // If includeStatuses is provided, it means we want leads that MATCH the stageId OR match any of the statuses
        // This is for the "Auto Stage" logic where we want everything that *should* be in this stage
        queryBuilder.andWhere(
          "(lead.stageId = :stageId OR lead.status IN (:...statuses))",
          { stageId, statuses: includeStatuses }
        );
      } else {
        // Standard strict filtering
        queryBuilder.andWhere("lead.stageId = :stageId", { stageId });
      }
    }

    // Add status filter if provided
    if (status && status.trim() !== "") {
      queryBuilder.andWhere("lead.status = :status", { status });
    }

    // Add visaCategory filter if provided
    if (visaCategory && visaCategory.trim() !== "") {
      queryBuilder.andWhere("lead.visaCategory = :visaCategory", { visaCategory });
    }

    // Add country filter if provided
    if (country && country.trim() !== "") {
      queryBuilder.andWhere("lead.country = :country", { country });
    }

    // Add search filter if provided
    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      queryBuilder.andWhere(
        "(lead.fullname LIKE :search OR lead.email LIKE :search OR lead.phone LIKE :search)",
        { search: searchTerm }
      );
    }

    // Add date filters
    if (date) {
      queryBuilder.andWhere("DATE(lead.createdAt) = :date", { date });
    } else {
      if (fromDate) {
        queryBuilder.andWhere("DATE(lead.createdAt) >= :fromDate", { fromDate });
      }
      if (toDate) {
        queryBuilder.andWhere("DATE(lead.createdAt) <= :toDate", { toDate });
      }
    }

    // Get total count with filters
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const data = await queryBuilder
      .orderBy("lead.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: number): Promise<Lead | null> {
    return await this.repository.findOne({
      where: { id, isActive: true },
      relations: ["stage", "assignments", "assignments.assignedToUser", "assignments.assignedByUser", "histories", "histories.assignedToUser", "histories.assignedByUser", "attempts", "attempts.followType", "reminders", "documents", "notes", "metaForm"],
    });
  }

  async findByEmail(email: string): Promise<Lead | null> {
    return await this.repository.findOne({
      where: { email, isActive: true },
    });
  }

  async findByEmails(emails: string[]): Promise<Lead[]> {
    if (!emails || emails.length === 0) {
      return [];
    }
    return await this.repository
      .createQueryBuilder("lead")
      .where("lead.email IN (:...emails)", { emails })
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .getMany();
  }

  async findByPhone(phone: string): Promise<Lead | null> {
    return await this.repository.findOne({
      where: { phone, isActive: true },
    });
  }

  async findByPhones(phones: string[]): Promise<Lead[]> {
    if (!phones || phones.length === 0) {
      return [];
    }
    return await this.repository
      .createQueryBuilder("lead")
      .where("lead.phone IN (:...phones)", { phones })
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .getMany();
  }

  async findByStage(stageId: number): Promise<Lead[]> {
    return await this.repository.find({
      where: { stageId: stageId, isActive: true },
      relations: ["stage", "assignments"],
    });
  }

  async create(leadData: Partial<Lead>): Promise<Lead> {
    const lead = this.repository.create(leadData);
    return await this.repository.save(lead);
  }

  async update(id: number, leadData: Partial<Lead>): Promise<Lead | null> {
    await this.repository.update(id, leadData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    // Soft delete
    const result = await this.repository.update(id, { isActive: false });
    return result.affected ? result.affected > 0 : false;
  }

  async hardDelete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async findLeadsByUserId(
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
  ): Promise<{ data: (Lead & { attemptCount: number })[]; total: number }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.repository.createQueryBuilder("lead")
      .leftJoinAndSelect("lead.stage", "stage")
      .leftJoinAndSelect("lead.assignments", "assignments")
      .leftJoinAndSelect("assignments.assignedToUser", "assignmentAssignedToUser")
      .leftJoinAndSelect("assignments.assignedByUser", "assignmentAssignedByUser")
      .leftJoinAndSelect("lead.metaForm", "metaForm")
      .loadRelationCountAndMap("lead.attemptCount", "lead.attempts")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("assignments.assignedTo = :userId", { userId });

    if (filters) {
      if (filters.stageId !== undefined) {
        queryBuilder.andWhere("lead.stageId = :stageId", { stageId: filters.stageId });
      }

      if (filters.status && filters.status.trim() !== "") {
        queryBuilder.andWhere("lead.status = :status", { status: filters.status });
      }

      if (filters.visaCategory && filters.visaCategory.trim() !== "") {
        queryBuilder.andWhere("lead.visaCategory = :visaCategory", { visaCategory: filters.visaCategory });
      }

      if (filters.country && filters.country.trim() !== "") {
        queryBuilder.andWhere("lead.country = :country", { country: filters.country });
      }

      if (filters.search && filters.search.trim() !== "") {
        const searchTerm = `%${filters.search.trim()}%`;
        queryBuilder.andWhere(
          "(lead.fullname LIKE :search OR lead.email LIKE :search OR lead.phone LIKE :search)",
          { search: searchTerm }
        );
      }

      if (filters.date) {
        queryBuilder.andWhere("DATE(lead.createdAt) = :date", { date: filters.date });
      } else {
        if (filters.fromDate) {
          queryBuilder.andWhere("DATE(lead.createdAt) >= :fromDate", { fromDate: filters.fromDate });
        }
        if (filters.toDate) {
          queryBuilder.andWhere("DATE(lead.createdAt) <= :toDate", { toDate: filters.toDate });
        }
      }
    }

    const total = await queryBuilder.getCount();

    const data = (await queryBuilder
      .orderBy("lead.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany()) as unknown as (Lead & { attemptCount: number })[];

    return { data, total };
  }

  async countHotLeadsByUserId(userId: number): Promise<number> {
    return await this.repository.createQueryBuilder("lead")
      .leftJoin("lead.assignments", "assignments")
      .leftJoin("lead.stage", "stage")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("assignments.assignedTo = :userId", { userId })
      .andWhere("stage.name = :status", { status: "Hot" })
      .getCount();
  }

  async count(): Promise<number> {
    return await this.repository.count({ where: { isActive: true } });
  }

  async countByStage(stageId: number): Promise<number> {
    return await this.repository.count({ where: { stageId: stageId, isActive: true } });
  }

  async bulkCreate(leadsData: Partial<Lead>[]): Promise<Lead[]> {
    const leads = this.repository.create(leadsData);
    return await this.repository.save(leads);
  }

  async searchLeadsWithCursor(leadId?: number): Promise<Lead[]> {
    const limit = 100;

    const queryBuilder = this.repository.createQueryBuilder("lead")
      .leftJoinAndSelect("lead.stage", "stage")
      .leftJoinAndSelect("lead.assignments", "assignments")
      .leftJoinAndSelect("assignments.assignedToUser", "assignmentAssignedToUser")
      .leftJoinAndSelect("assignments.assignedByUser", "assignmentAssignedByUser")
      .where("lead.isActive = :isActive", { isActive: true });

    if (leadId !== undefined && leadId !== null) {
      // If leadId is provided, get records from that leadId onwards (including the leadId)
      queryBuilder.andWhere("lead.id >= :leadId", { leadId });
    }

    // Order by id ascending for cursor-based pagination
    const data = await queryBuilder
      .orderBy("lead.id", "ASC")
      .take(limit)
      .getMany();

    return data;
  }

  async findPaymentReceivedPaginated(
    page: number = 1,
    limit: number = 10,
    userId: number
  ): Promise<any> {
    const skip = (page - 1) * limit;

    // console.log("Leads with PAYMENT_DONE status for userId", userId, leads);

    const queryBuilder = this.repository.createQueryBuilder("lead")
      .leftJoinAndSelect("lead.stage", "stage")
      .leftJoinAndSelect("lead.assignments", "assignments")
      .leftJoinAndSelect("assignments.assignedToUser", "assignmentAssignedToUser")
      .leftJoinAndSelect("assignments.assignedByUser", "assignmentAssignedByUser")
      .leftJoinAndSelect("lead.reminders", "reminders")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("assignments.assignedTo = :userId", { userId })
      .andWhere("lead.status = :status", { status: LeadStatus.PAYMENT_DONE });

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy("lead.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getUniqueCountries(): Promise<string[]> {
    const result = await this.repository
      .createQueryBuilder("lead")
      .select("DISTINCT lead.country", "country")
      .where("lead.country IS NOT NULL")
      .andWhere("lead.country != ''")
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .orderBy("lead.country", "ASC")
      .getRawMany();

    return result.map((item) => item.country);
  }

  async getUniqueVisaCategories(): Promise<string[]> {
    const result = await this.repository
      .createQueryBuilder("lead")
      .select("DISTINCT lead.visaCategory", "visaCategory")
      .where("lead.visaCategory IS NOT NULL")
      .andWhere("lead.visaCategory != ''")
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .orderBy("lead.visaCategory", "ASC")
      .getRawMany();

    return result.map((item) => item.visaCategory);
  }
  async countActiveLeadsByUserId(userId: number): Promise<number> {
    return await this.repository.createQueryBuilder("lead")
      .leftJoin("lead.assignments", "assignments")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("assignments.assignedTo = :userId", { userId })
      .andWhere("lead.status NOT IN (:...excludedStatuses)", { excludedStatuses: [LeadStatus.NOT_INTERESTED, LeadStatus.COMPLETED, LeadStatus.NOT_ELIGIBLE, LeadStatus.WRONG_NUMBER, LeadStatus.REFUNDED] })
      .getCount();
  }

  async countLeadsByStageNameAndUserId(userId: number, stageName: string): Promise<number> {
    return await this.repository.createQueryBuilder("lead")
      .leftJoin("lead.stage", "stage")
      .leftJoin("lead.assignments", "assignments")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("assignments.assignedTo = :userId", { userId })
      .andWhere("stage.name = :stageName", { stageName })
      .getCount();
  }

  async countLeadsByStatusAndUserId(userId: number, status: string): Promise<number> {
    return await this.repository.createQueryBuilder("lead")
      .leftJoin("lead.assignments", "assignments")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("assignments.assignedTo = :userId", { userId })
      .andWhere("lead.status = :status", { status })
      .getCount();
  }

  async getWonLostCountByUserId(userId: number): Promise<{ won: number; lost: number }> {
    const result = await this.repository.createQueryBuilder("lead")
      .leftJoin("lead.assignments", "assignments")
      .addSelect("SUM(CASE WHEN lead.status IN ('Completed', 'Visa Granted', 'Endorsement Granted') THEN 1 ELSE 0 END)", "won")
      .addSelect("SUM(CASE WHEN lead.status IN ('Not Interested', 'Not Eligible', 'Wrong Number', 'Refunded') THEN 1 ELSE 0 END)", "lost")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("assignments.assignedTo = :userId", { userId })
      .getRawOne();

    return {
      won: parseInt(result.won || "0"),
      lost: parseInt(result.lost || "0"),
    };
  }

  async getPipelineStatsByUserId(userId: number): Promise<{ stageName: string; count: number; color: string }[]> {
    const result = await this.repository.createQueryBuilder("lead")
      .leftJoin("lead.stage", "stage")
      .leftJoin("lead.assignments", "assignments")
      .select("stage.name", "stageName")
      .addSelect("COUNT(lead.id)", "count")
      // .addSelect("stage.color", "color")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("assignments.assignedTo = :userId", { userId })
      .groupBy("stage.name")
      // .addGroupBy("stage.color")
      .getRawMany();

    return result.map(r => ({
      stageName: r.stageName,
      count: parseInt(r.count),
      color: r?.color || "#000000"
    }));
  }

  async findPriorityLeadsByUserId(userId: number, limit: number = 10): Promise<Lead[]> {
    return await this.repository.createQueryBuilder("lead")
      .leftJoinAndSelect("lead.assignments", "assignments")
      .leftJoinAndSelect("lead.reminders", "reminders", "reminders.status = :remStatus", { remStatus: "pending" })
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("assignments.assignedTo = :userId", { userId })
      .andWhere("lead.status IN (:...statuses)", { statuses: [LeadStatus.NEW, LeadStatus.NOT_ANSWERED, LeadStatus.FOLLOW_UP, LeadStatus.BUSY, LeadStatus.NO_SHOW, LeadStatus.DECISION_PENDING] })
      .orderBy("CASE WHEN lead.status = 'Follow Up' THEN 1 WHEN lead.status = 'New' THEN 2 ELSE 3 END", "ASC")
      .addOrderBy("lead.updatedAt", "ASC")
      .getMany();
  }

  async getMonthlyLeadStats(months: number = 6): Promise<{ month: string, total: number, converted: number }[]> {
    const monthsData: { month: string, total: number, converted: number }[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      // Calculate start of the month
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });

      // Set precise start and end times for the month
      const startDate = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
      const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      // console.log(`Calculating stats for: ${monthName} (${startDate.toISOString()} to ${endDate.toISOString()})`);

      const stats = await this.repository.createQueryBuilder("lead")
        .select("COUNT(lead.id)", "total")
        .addSelect(`SUM(CASE WHEN lead.status IN ('${LeadStatus.PAYMENT_DONE}', '${LeadStatus.COMPLETED}', '${LeadStatus.NO_SHOW}', '${LeadStatus.VISA_GRANTED}', '${LeadStatus.ENDORSEMENT_GRANTED}') THEN 1 ELSE 0 END)`, "converted")
        .where("lead.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
        .andWhere("lead.isActive = :isActive", { isActive: true })
        .getRawOne();

      monthsData.push({
        month: monthName,
        total: parseInt(stats.total || "0"),
        converted: parseInt(stats.converted || "0")
      });
    }

    return monthsData;
  }

  async getPipelineDistribution(): Promise<{ stageName: string, count: number, color: string }[]> {
    const result = await this.repository.createQueryBuilder("lead")
      .leftJoin("lead.stage", "stage")
      .select("stage.name", "stageName")
      .addSelect("COUNT(lead.id)", "count")
      // .addSelect("stage.color", "color")
      .where("lead.isActive = :isActive", { isActive: true })
      .groupBy("stage.name")
      // .addGroupBy("stage.color")
      .getRawMany();

    return result.map(r => ({
      stageName: r.stageName,
      count: parseInt(r.count),
      color: r.color || "#3b82f6"
    }));
  }

  async countConvertedLeads(startDate?: Date): Promise<number> {
    const query = this.repository.createQueryBuilder("lead")
      .where("lead.isActive = :isActive", { isActive: true })
      .andWhere("lead.status IN (:...statuses)", { statuses: [LeadStatus.PAYMENT_DONE, LeadStatus.COMPLETED, LeadStatus.NO_SHOW, LeadStatus.VISA_GRANTED, LeadStatus.ENDORSEMENT_GRANTED] });

    if (startDate) {
      query.andWhere("lead.createdAt >= :startDate", { startDate });
    }

    return await query.getCount();
  }

  async countTotalLeadsInRange(startDate?: Date): Promise<number> {
    const query = this.repository.createQueryBuilder("lead")
      .where("lead.isActive = :isActive", { isActive: true });

    if (startDate) {
      query.andWhere("lead.createdAt >= :startDate", { startDate });
    }

    return await query.getCount();
  }

  async countLeadsAssignedToUserByDate(userId: number, date: Date): Promise<number> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    return await this.repository.createQueryBuilder("lead")
      .leftJoin("lead.assignments", "assignments")
      .where("assignments.assignedTo = :userId", { userId })
      .andWhere("assignments.createdAt BETWEEN :startOfDay AND :endOfDay", { startOfDay, endOfDay })
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .getCount();
  }

  async findLeadsAssignedToUserByDate(userId: number, date: Date): Promise<Lead[]> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    return await this.repository.createQueryBuilder("lead")
      .leftJoinAndSelect("lead.assignments", "assignments")
      .leftJoinAndSelect("lead.stage", "stage")
      .where("assignments.assignedTo = :userId", { userId })
      .andWhere("assignments.createdAt BETWEEN :startOfDay AND :endOfDay", { startOfDay, endOfDay })
      .andWhere("lead.isActive = :isActive", { isActive: true })
      .orderBy("assignments.createdAt", "DESC")
      .getMany();
  }
}
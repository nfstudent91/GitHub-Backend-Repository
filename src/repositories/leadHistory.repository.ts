import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { LeadHistory } from "../entities/LeadHistory";

export class LeadHistoryRepository {
  private repository: Repository<LeadHistory>;

  constructor() {
    this.repository = AppDataSource.getRepository(LeadHistory);
  }

  async findAll(): Promise<LeadHistory[]> {
    return await this.repository.find({
      relations: ["lead", "assignedToUser", "assignedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: number): Promise<LeadHistory | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["lead", "lead.stage", "assignedToUser", "assignedByUser"],
    });
  }

  async findByLeadId(leadId: number): Promise<LeadHistory[]> {
    return await this.repository.find({
      where: { leadId },
      relations: ["lead", "assignedToUser", "assignedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  async findByAssignedTo(userId: number): Promise<LeadHistory[]> {
    return await this.repository.find({
      where: { assignedTo: userId },
      relations: ["lead", "lead.stage", "assignedToUser", "assignedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  async findByAssignedBy(userId: number): Promise<LeadHistory[]> {
    return await this.repository.find({
      where: { assignedBy: userId },
      relations: ["lead", "assignedToUser", "assignedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  async create(historyData: Partial<LeadHistory>): Promise<LeadHistory> {
    const history = this.repository.create(historyData);
    return await this.repository.save(history);
  }

  async update(id: number, historyData: Partial<LeadHistory>): Promise<LeadHistory | null> {
    await this.repository.update(id, historyData);
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
}


import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { LeadAssignment } from "../entities/LeadAssignment";

export class LeadAssignmentRepository {
  private repository: Repository<LeadAssignment>;

  constructor() {
    this.repository = AppDataSource.getRepository(LeadAssignment);
  }

  async findAll(): Promise<LeadAssignment[]> {
    return await this.repository.find({
      relations: ["lead", "assignedToUser", "assignedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: number): Promise<LeadAssignment | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["lead", "assignedToUser", "assignedByUser"],
    });
  }

  async findByLeadId(leadId: number): Promise<LeadAssignment[]> {
    return await this.repository.find({
      where: { leadId },
      relations: ["lead", "assignedToUser", "assignedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  async findByAssignedTo(userId: number): Promise<LeadAssignment[]> {
    return await this.repository.find({
      where: { assignedTo: userId },
      relations: ["lead", "lead.stage", "assignedToUser", "assignedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  async findByAssignedBy(userId: number): Promise<LeadAssignment[]> {
    return await this.repository.find({
      where: { assignedBy: userId },
      relations: ["lead", "assignedToUser", "assignedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  async findCurrentAssignment(leadId: number): Promise<LeadAssignment | null> {
    return await this.repository.findOne({
      where: { leadId },
      relations: ["lead", "assignedToUser", "assignedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  async create(assignmentData: Partial<LeadAssignment>): Promise<LeadAssignment> {
    const assignment = this.repository.create(assignmentData);
    return await this.repository.save(assignment);
  }

  async update(id: number, assignmentData: Partial<LeadAssignment>): Promise<LeadAssignment | null> {
    await this.repository.update(id, assignmentData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async countByAssignedTo(userId: number): Promise<number> {
    return await this.repository.count({ where: { assignedTo: userId } });
  }

  async bulkCreate(assignmentsData: Partial<LeadAssignment>[]): Promise<LeadAssignment[]> {
    const assignments = this.repository.create(assignmentsData);
    return await this.repository.save(assignments);
  }
}


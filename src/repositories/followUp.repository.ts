import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { FollowUp } from "../entities/FollowUp";

export class FollowUpRepository {
  private repository: Repository<FollowUp>;

  constructor() {
    this.repository = AppDataSource.getRepository(FollowUp);
  }

  async findAll(): Promise<FollowUp[]> {
    return await this.repository.find({
      where: { isActive: true },
      relations: ["leadAttempts"],
    });
  }

  async findById(id: number): Promise<FollowUp | null> {
    return await this.repository.findOne({
      where: { id, isActive: true },
      relations: ["leadAttempts"],
    });
  }

  async findByName(name: string): Promise<FollowUp | null> {
    return await this.repository.findOne({
      where: { name, isActive: true },
    });
  }

  async create(followUpData: Partial<FollowUp>): Promise<FollowUp> {
    const followUp = this.repository.create(followUpData);
    return await this.repository.save(followUp);
  }

  async update(id: number, followUpData: Partial<FollowUp>): Promise<FollowUp | null> {
    await this.repository.update(id, followUpData);
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

  async count(): Promise<number> {
    return await this.repository.count({ where: { isActive: true } });
  }
}


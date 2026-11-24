import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Stage } from "../entities/Stage";

export class StageRepository {
  private repository: Repository<Stage>;

  constructor() {
    this.repository = AppDataSource.getRepository(Stage);
  }

  async findAll(): Promise<Stage[]> {
    return await this.repository.find({
      where: { isActive: true },
      relations: ["leads"],
    });
  }

  async findById(id: number): Promise<Stage | null> {
    return await this.repository.findOne({
      where: { id, isActive: true },
      relations: ["leads"],
    });
  }

  async findByName(name: string): Promise<Stage | null> {
    return await this.repository.findOne({
      where: { name, isActive: true },
    });
  }

  async create(stageData: Partial<Stage>): Promise<Stage> {
    const stage = this.repository.create(stageData);
    return await this.repository.save(stage);
  }

  async update(id: number, stageData: Partial<Stage>): Promise<Stage | null> {
    await this.repository.update(id, stageData);
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


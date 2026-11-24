import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Role } from "../entities/Role";

export class RoleRepository {
  private repository: Repository<Role>;

  constructor() {
    this.repository = AppDataSource.getRepository(Role);
  }

  async findAll(): Promise<Role[]> {
    return await this.repository.find({
      where: { isActive: true },
      relations: ["users"],
    });
  }

  async findById(id: number): Promise<Role | null> {
    return await this.repository.findOne({
      where: { id, isActive: true },
      relations: ["users"],
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return await this.repository.findOne({
      where: { name, isActive: true },
    });
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.repository.create(roleData);
    return await this.repository.save(role);
  }

  async update(id: number, roleData: Partial<Role>): Promise<Role | null> {
    await this.repository.update(id, roleData);
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


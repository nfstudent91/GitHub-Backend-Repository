import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find({
      where: { isActive: true },
      relations: ["role"],
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        phone: true,
        roleId: true,
        isActive: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
      order: {
        createdAt: "DESC"
      }
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({
      where: { id, isActive: true },
      relations: ["role"],
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        phone: true,
        roleId: true,
        isActive: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    // Note: This method includes password for authentication purposes
    // Password should be removed in service layer before returning to client
    return await this.repository.findOne({
      where: { username, isActive: true },
      relations: ["role"],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    // Note: This method includes password for authentication purposes
    // Password should be removed in service layer before returning to client
    return await this.repository.findOne({
      where: { email, isActive: true },
      relations: {
        role: true,
      },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
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

  async findByResetToken(token: string): Promise<User | null> {
    return await this.repository.findOne({
      where: {
        resetPasswordToken: token,
        isActive: true,
      },
      relations: ["role"],
    });
  }

  async updateResetToken(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await this.repository.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expiresAt,
    });
  }

  async clearResetToken(userId: number): Promise<void> {
    await this.repository.update(userId, {
      resetPasswordToken: null as any,
      resetPasswordExpires: null as any,
    });
  }

  async findAllExcludingRoles(excludedRoleNames: string[]): Promise<User[]> {
    return await this.repository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .where("user.isActive = :isActive", { isActive: true })
      .andWhere("role.name NOT IN (:...excludedRoles)", { excludedRoles: excludedRoleNames })
      .select([
        "user.id",
        "user.fullname",
        "role.id",
        "role.name",
      ])
      .orderBy("user.createdAt", "DESC")
      .getMany();
  }

  async findTelleCallers(): Promise<User[]> {
    return await this.repository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .where("user.isActive = :isActive", { isActive: true })
      .andWhere("role.name = :roleName", { roleName: "TeleCaller" })
      .select([
        "user.id",
        "user.fullname",
      ])
      .orderBy("user.id", "ASC")
      .getMany();
  }
}
import { RoleRepository } from "../repositories/role.repository";
import { Role } from "../entities/Role";

export class RoleService {
  private roleRepository: RoleRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
  }

  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }

  async getRoleById(id: number): Promise<Role | null> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error("Role not found");
    }
    return role;
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    // Business logic: Check if role with same name already exists
    const existingRole = await this.roleRepository.findByName(roleData.name!);
    if (existingRole) {
      throw new Error("Role with this name already exists");
    }

    // Validate required fields
    if (!roleData.name || roleData.name.trim() === "") {
      throw new Error("Role name is required");
    }

    return await this.roleRepository.create(roleData);
  }

  async updateRole(id: number, roleData: Partial<Role>): Promise<Role | null> {
    // Check if role exists
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new Error("Role not found");
    }

    // If updating name, check for duplicates
    if (roleData.name && roleData.name !== existingRole.name) {
      const duplicateRole = await this.roleRepository.findByName(roleData.name);
      if (duplicateRole) {
        throw new Error("Role with this name already exists");
      }
    }

    return await this.roleRepository.update(id, roleData);
  }

  async deleteRole(id: number): Promise<boolean> {
    // Check if role exists
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new Error("Role not found");
    }

    // Business logic: Check if role has any active users
    if (existingRole.users && existingRole.users.length > 0) {
      throw new Error("Cannot delete role with active users. Please reassign users first.");
    }

    return await this.roleRepository.delete(id);
  }

  async getRoleCount(): Promise<number> {
    return await this.roleRepository.count();
  }
}


import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { RoleRepository } from "../repositories/role.repository";
import { User } from "../entities/User";

interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: string; // Role name like "manager", "admin", etc.
  phone?: string;
  createdBy?: string;
}

interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  phone?: string;
  isActive?: boolean;
}

export class UserService {
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

    async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    // Validate required fields
    if (!userData.name || userData.name.trim() === "") {
      throw new Error("Name is required");
    }
    if (!userData.email || userData.email.trim() === "") {
      throw new Error("Email is required");
    }
    if (!userData.password || userData.password.trim() === "") {
      throw new Error("Password is required");
    }
    if (!userData.role || userData.role.trim() === "") {
      throw new Error("Role is required");
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Find role by name
    const role = await this.roleRepository.findByName(userData.role);
    if (!role) {
      throw new Error(`Role "${userData.role}" not found`);
    }

    // Generate username from email (take part before @)
    let username = userData.email.split("@")[0];

    // Check if username already exists
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      // If username exists, append a number
      let counter = 1;
      let newUsername = `${username}${counter}`;
      while (await this.userRepository.findByUsername(newUsername)) {
        counter++;
        newUsername = `${username}${counter}`;
      }
      username = newUsername;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user
    const user = await this.userRepository.create({
      fullname: userData.name,
      username: username,
      email: userData.email,
      password: hashedPassword,
      phone: userData.phone || undefined,
      roleId: role.id,
      isActive: true,
      createdBy: userData.createdBy || "admin",
    });

    // Return user (password is excluded by repository)
    const createdUser = await this.userRepository.findById(user.id);
    if (!createdUser) {
      throw new Error("Failed to retrieve created user");
    }
    return createdUser;
  }

  async updateUser(id: number, userData: UpdateUserDTO): Promise<User | null> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updateData: Partial<User> = {};

    // Update name if provided
    if (userData.name !== undefined) {
      if (userData.name.trim() === "") {
        throw new Error("Name cannot be empty");
      }
      updateData.fullname = userData.name;
    }

    // Update email if provided
    if (userData.email !== undefined) {
      if (userData.email.trim() === "") {
        throw new Error("Email cannot be empty");
      }
      // Check if email already exists (excluding current user)
      const existingEmail = await this.userRepository.findByEmail(userData.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new Error("Email already exists");
      }
      updateData.email = userData.email;
    }

    // Update password if provided
    if (userData.password !== undefined) {
      if (userData.password.trim() === "") {
        throw new Error("Password cannot be empty");
      }
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(userData.password, salt);
    }

    // Update role if provided
    if (userData.role !== undefined) {
      const role = await this.roleRepository.findByName(userData.role);
      if (!role) {
        throw new Error(`Role "${userData.role}" not found`);
      }
      updateData.roleId = role.id;
    }

    // Update phone if provided
    if (userData.phone !== undefined) {
      updateData.phone = userData.phone || undefined;
    }

    // Update isActive if provided
    if (userData.isActive !== undefined) {
      updateData.isActive = userData.isActive;
    }

    return await this.userRepository.update(id, updateData);
  }

  async deleteUser(id: number): Promise<boolean> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Prevent deleting yourself (optional check)
    // This can be added if needed

    return await this.userRepository.delete(id);
  }

  async getUserCount(): Promise<number> {
    return await this.userRepository.count();
  }

  async getUsersExcludingAdmin(): Promise<User[]> {
    // Exclude Admin and Processing roles (if Processing exists)
    return await this.userRepository.findAllExcludingRoles(["Admin"]);
  }
  async updatePassword(id: number, password: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.userRepository.update(id, {
      password: hashedPassword,
      isPasswordChanged: true,
    });
  }
}


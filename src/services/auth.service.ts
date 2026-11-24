import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRepository } from "../repositories/user.repository";
import { RoleRepository } from "../repositories/role.repository";
import { EmailService } from "../services/email.service";
import { User } from "../entities/User";

interface RegisterDTO {
  fullname: string;
  username: string;
  password: string;
  email: string;
  phone?: string;
  roleId: number;
  createdBy?: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface AuthResponse {
  user: Partial<User>;
  role?: string;
  token: string;
}

export class AuthService {
  private emailService: EmailService;
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
    this.emailService = new EmailService();
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";
  }

  async register(registerData: RegisterDTO): Promise<AuthResponse> {
    // Validate required fields
    if (!registerData.username || !registerData.password || !registerData.email || !registerData.fullname) {
      throw new Error("Username, password, email, and fullname are required");
    }

    // Check if username already exists
    const existingUser = await this.userRepository.findByUsername(registerData.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(registerData.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Validate role exists
    const role = await this.roleRepository.findById(registerData.roleId);
    if (!role) {
      throw new Error("Invalid role ID");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerData.password, salt);

    // Create user
    const user = await this.userRepository.create({
      fullname: registerData.fullname,
      username: registerData.username,
      password: hashedPassword,
      email: registerData.email,
      phone: registerData.phone,
      roleId: registerData.roleId,
      isActive: true,
      createdBy: registerData.createdBy || "system",
    });

    // Generate JWT token
    const token = this.generateToken(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(loginData: LoginDTO): Promise<AuthResponse> {
    // Validate required fields
    if (!loginData.email || !loginData.password) {
      throw new Error("Username and password are required");
    }

    // Find user by email (includes password for verification)
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Remove password from response
    const { password, role, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      role: role.name,
      token,
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  async getUserById(id: number): Promise<Partial<User> | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user as User;
    return userWithoutPassword;
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as string,
    } as jwt.SignOptions);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    // Find user with password for verification
    const userData = await this.userRepository.findById(userId);
    if (!userData) {
      throw new Error("User not found");
    }

    const user = await this.userRepository.findByUsername(userData.username);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await this.userRepository.update(userId, { password: hashedPassword });

    return true;
  }

  // POST /api/auth/forgot-password - Request password reset
  async forgotPassword(email: string): Promise<void | null> {
    // Validate email
    if (!email) {
      throw new Error("Email is required");
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      // Return null to indicate we processed the request (even if user doesn't exist)
      return null;
    }

    // Check if user is active
    if (!user.isActive) {
      // Still return null for security (don't reveal account status)
      return null;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Set expiration (1 hour from now)
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

    // Save reset token to database
    await this.userRepository.updateResetToken(user.id, resetToken, resetPasswordExpires);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    // No need to return token to client
    return;

  }

  // POST /api/auth/reset-password - Reset password using token
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Validate inputs
    if (!token || !newPassword) {
      throw new Error("Token and new password are required");
    }

    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Find user by reset token
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Check if token has expired
    // if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    //   throw new Error("Reset token has expired");
    // }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await this.userRepository.update(user.id, { password: hashedPassword });
    await this.userRepository.clearResetToken(user.id);

    return true;
  }
}


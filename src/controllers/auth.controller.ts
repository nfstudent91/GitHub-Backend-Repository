import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";

export class AuthController {
  private authService: AuthService;
  private userService: UserService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
  }

  // POST /api/auth/register - Register new user
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const registerData = req.body;
      const result = await this.authService.register(registerData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error: any) {
      if (
        error.message.includes("already exists") ||
        error.message.includes("required") ||
        error.message.includes("Invalid role")
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error registering user",
          error: error.message,
        });
      }
    }
  };

  // POST /api/auth/login - Login user
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Login attempt: ", req.body);
      const loginData = req.body;
      const result = await this.authService.login(loginData);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      if (
        error.message.includes("Invalid") ||
        error.message.includes("required") ||
        error.message.includes("inactive")
      ) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error during login",
          error: error.message,
        });
      }
    }
  };

  // GET /api/auth/me - Get current user profile
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // User info is attached to request by auth middleware
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = await this.authService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving profile",
        error: error.message,
      });
    }
  };

  // POST /api/auth/change-password - Change user password
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { oldPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: "Old password and new password are required",
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
        return;
      }

      await this.authService.changePassword(userId, oldPassword, newPassword);

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error: any) {
      if (error.message.includes("incorrect") || error.message.includes("not found")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error changing password",
          error: error.message,
        });
      }
    }
  };

  // POST /api/auth/forgot-password - Request password reset
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      await this.authService.forgotPassword(email);

      // Always return success message for security (don't reveal if email exists)
      res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link will be sent",
      });
    } catch (error: any) {
      if (error.message.includes("required")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        // For security, return success even on error (don't reveal if email exists)
        res.status(200).json({
          success: true,
          message: "If the email exists, a password reset link will be sent",
        });
      }
    }
  };

  // POST /api/auth/reset-password - Reset password using token
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: "Token and new password are required",
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
        return;
      }

      await this.authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error: any) {
      if (
        error.message.includes("required") ||
        error.message.includes("Invalid") ||
        error.message.includes("expired") ||
        error.message.includes("at least")
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error resetting password",
          error: error.message,
        });
      }
    }
  };

  // POST /api/auth/logout - Logout user
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // Since JWT tokens are stateless, logout is handled client-side
      // The client should remove the token from storage
      // This endpoint confirms the logout request
      res.status(200).json({
        success: true,
        message: "Logout successful. Please remove the token from client storage.",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error during logout",
        error: error.message,
      });
    }
  };

  // PUT /api/auth/users/:id/password - Update user password by ID (Admin/Manager)
  updateUserPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { password } = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      if (!password || password.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Password is required",
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
        return;
      }

      await this.userService.updatePassword(id, password);

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error: any) {
      if (error.message === "User not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error updating password",
          error: error.message,
        });
      }
    }
  };
}


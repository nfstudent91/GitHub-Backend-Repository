import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /api/admin/users - Get all users
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving users",
        error: error.message,
      });
    }
  };

  // GET /api/admin/users/:id - Get user by ID
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      const user = await this.userService.getUserById(id);
      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
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
          message: "Error retrieving user",
          error: error.message,
        });
      }
    }
  };

  // POST /api/admin/users - Create new user
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = req.body;

      // Add createdBy from authenticated user if available
      const createdBy = req.user?.username || req.user?.fullname || "admin";

      // const isUserExists = await this.userService.getUserByEmail(
      //   userData.email,
      // );

      // if (isUserExists) {
      //   res.status(409).json({
      //     success: false,
      //     message: "Email already exists",
      //   });
      // }
      
      const user = await this.userService.createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone,
        createdBy: createdBy,
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error: any) {
      if (
        error.message.includes("already exists") ||
        error.message.includes("required") ||
        error.message.includes("not found") ||
        error.message.includes("cannot be empty")
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error creating user",
          error: error.message,
        });
      }
    }
  };

  // PUT /api/admin/users/:id - Update user
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      const userData = req.body;
      const user = await this.userService.updateUser(id, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone,
        isActive: userData.isActive,
      });

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error: any) {
      if (
        error.message === "User not found" ||
        error.message.includes("not found")
      ) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (
        error.message.includes("already exists") ||
        error.message.includes("cannot be empty")
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error updating user",
          error: error.message,
        });
      }
    }
  };

  // DELETE /api/admin/users/:id - Delete user (soft delete)
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      await this.userService.deleteUser(id);
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
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
          message: "Error deleting user",
          error: error.message,
        });
      }
    }
  };

  // GET /api/admin/users/count - Get user count
  getUserCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.userService.getUserCount();
      res.status(200).json({
        success: true,
        message: "User count retrieved successfully",
        count: count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving user count",
        error: error.message,
      });
    }
  };

  // GET /api/users/assignable - Get all users except Admin role
  getAssignableUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getUsersExcludingAdmin();
      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
        // count: users.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving users",
        error: error.message,
      });
    }
  };
  // PUT /api/admin/users/:id/password - Update user password
  updatePassword = async (req: Request, res: Response): Promise<void> => {
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

      await this.userService.updatePassword(id, password);

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error: any) {
      if (error.message === "User not found") {
        res.status(404).json({ success: false, message: "User not found" });
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

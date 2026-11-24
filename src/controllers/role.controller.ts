import { Request, Response } from "express";
import { RoleService } from "../services/role.service";

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  // GET /api/roles - Get all roles
  getAllRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await this.roleService.getAllRoles();
      res.status(200).json({
        success: true,
        message: "Roles retrieved successfully",
        data: roles.filter(role => role.name !== "Admin"),
        // count: roles.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving roles",
        error: error.message,
      });
    }
  };

  // GET /api/roles/:id - Get role by ID
  getRoleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid role ID",
        });
        return;
      }

      const role = await this.roleService.getRoleById(id);
      res.status(200).json({
        success: true,
        message: "Role retrieved successfully",
        data: role,
      });
    } catch (error: any) {
      if (error.message === "Role not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error retrieving role",
          error: error.message,
        });
      }
    }
  };

  // POST /api/roles - Create new role
  createRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const roleData = req.body;
      const role = await this.roleService.createRole(roleData);
      res.status(201).json({
        success: true,
        message: "Role created successfully",
        data: role,
      });
    } catch (error: any) {
      if (error.message.includes("already exists") || error.message.includes("required")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error creating role",
          error: error.message,
        });
      }
    }
  };

  // PUT /api/roles/:id - Update role
  updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid role ID",
        });
        return;
      }

      const roleData = req.body;
      const role = await this.roleService.updateRole(id, roleData);
      res.status(200).json({
        success: true,
        message: "Role updated successfully",
        data: role,
      });
    } catch (error: any) {
      if (error.message === "Role not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error.message.includes("already exists")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error updating role",
          error: error.message,
        });
      }
    }
  };

  // DELETE /api/roles/:id - Delete role (soft delete)
  deleteRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid role ID",
        });
        return;
      }

      await this.roleService.deleteRole(id);
      res.status(200).json({
        success: true,
        message: "Role deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Role not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error.message.includes("Cannot delete")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error deleting role",
          error: error.message,
        });
      }
    }
  };

  // GET /api/roles/count - Get role count
  getRoleCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.roleService.getRoleCount();
      res.status(200).json({
        success: true,
        message: "Role count retrieved successfully",
        count: count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving role count",
        error: error.message,
      });
    }
  };
}


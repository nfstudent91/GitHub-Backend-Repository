import { Request, Response } from "express";
import { LeadAssignmentService } from "../services/leadAssignment.service";

export class LeadAssignmentController {
  private leadAssignmentService: LeadAssignmentService;

  constructor() {
    this.leadAssignmentService = new LeadAssignmentService();
  }

  // GET /api/lead-assignments - Get all assignments
  getAllAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
      const assignments = await this.leadAssignmentService.getAllAssignments();
      res.status(200).json({
        success: true,
        message: "Lead assignments retrieved successfully",
        data: assignments,
        count: assignments.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving lead assignments",
        error: error.message,
      });
    }
  };

  // GET /api/lead-assignments/:id - Get assignment by ID
  getAssignmentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid assignment ID",
        });
        return;
      }

      const assignment = await this.leadAssignmentService.getAssignmentById(id);
      res.status(200).json({
        success: true,
        message: "Lead assignment retrieved successfully",
        data: assignment,
      });
    } catch (error: any) {
      if (error.message === "Lead assignment not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error retrieving lead assignment",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-assignments/lead/:leadId - Get assignments by lead ID
  getAssignmentsByLeadId = async (req: Request, res: Response): Promise<void> => {
    try {
      const leadId = parseInt(req.params.leadId);

      if (isNaN(leadId)) {
        res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
        return;
      }

      const assignments = await this.leadAssignmentService.getAssignmentsByLeadId(leadId);
      res.status(200).json({
        success: true,
        message: "Lead assignments retrieved successfully",
        data: assignments,
        count: assignments.length,
      });
    } catch (error: any) {
      if (error.message === "Lead not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error retrieving lead assignments",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-assignments/user/:userId - Get assignments by assigned to user ID
  getAssignmentsByAssignedTo = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      const assignments = await this.leadAssignmentService.getAssignmentsByAssignedTo(userId);
      res.status(200).json({
        success: true,
        message: "Lead assignments retrieved successfully",
        data: assignments,
        count: assignments.length,
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
          message: "Error retrieving lead assignments",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-assignments/lead/:leadId/current - Get current assignment for a lead
  getCurrentAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const leadId = parseInt(req.params.leadId);

      if (isNaN(leadId)) {
        res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
        return;
      }

      const assignment = await this.leadAssignmentService.getCurrentAssignment(leadId);
      if (!assignment) {
        res.status(404).json({
          success: false,
          message: "No assignment found for this lead",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Current assignment retrieved successfully",
        data: assignment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving current assignment",
        error: error.message,
      });
    }
  };

  // POST /api/lead-assignments - Create new assignment
  createAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const assignmentData = req.body;

      // Add assignedBy from authenticated user if available
      if (req.user && !assignmentData.assignedBy) {
        assignmentData.assignedBy = req.user.id;
      }

      // Add createdBy from authenticated user if available
      if (req.user && !assignmentData.createdBy) {
        assignmentData.createdBy = req.user.username || req.user.fullname;
      }

      const assignment = await this.leadAssignmentService.createAssignment(assignmentData);
      res.status(201).json({
        success: true,
        message: "Lead assignment created successfully",
        data: assignment,
      });
    } catch (error: any) {
      if (error.message.includes("required") || error.message.includes("not found")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error creating lead assignment",
          error: error.message,
        });
      }
    }
  };

  // PUT /api/lead-assignments/:id - Update assignment (supports bulk if id is 'bulk' or payload is an array)
  updateAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;

      // Handle bulk update
      if (id === "bulk" || Array.isArray(data)) {
        const assignmentsData = Array.isArray(data) ? data : [data];
        const results = [];
        const errors = [];

        for (const item of assignmentsData) {
          try {
            // Add assignedBy and createdBy if missing
            if (req.user && !item.assignedBy) item.assignedBy = req.user.id;
            if (req.user && !item.createdBy) item.createdBy = req.user.username || req.user.fullname;

            let result;
            if (item.id) {
              // Update by assignment ID
              result = await this.leadAssignmentService.updateAssignment(parseInt(item.id), item);
            } else if (item.leadId) {
              // Upsert by lead ID
              const upsertResult = await this.leadAssignmentService.upsertAssignment(item);
              result = upsertResult.assignment;
            } else if (id !== "bulk" && !isNaN(parseInt(id))) {
              // Update the ID from URL if it's not 'bulk'
              result = await this.leadAssignmentService.updateAssignment(parseInt(id), item);
            } else {
              throw new Error("Missing assignment ID or lead ID for item");
            }
            results.push(result);
          } catch (err: any) {
            errors.push({ item, error: err.message });
          }
        }

        res.status(200).json({
          success: errors.length === 0,
          message: errors.length === 0
            ? "Assignments processed successfully"
            : `Processed with ${errors.length} errors`,
          data: results,
          errors: errors.length > 0 ? errors : undefined,
        });
        return;
      }

      // Single update by ID from URL
      const assignmentId = parseInt(id);
      if (isNaN(assignmentId)) {
        res.status(400).json({
          success: false,
          message: "Invalid assignment ID",
        });
        return;
      }

      const assignment = await this.leadAssignmentService.updateAssignment(assignmentId, data);
      res.status(200).json({
        success: true,
        message: "Lead assignment updated successfully",
        data: assignment,
      });
    } catch (error: any) {
      if (error.message === "Lead assignment not found" || error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error updating lead assignment",
          error: error.message,
        });
      }
    }
  };

  // DELETE /api/lead-assignments/:id - Delete assignment
  deleteAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid assignment ID",
        });
        return;
      }

      await this.leadAssignmentService.deleteAssignment(id);
      res.status(200).json({
        success: true,
        message: "Lead assignment deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Lead assignment not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error deleting lead assignment",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-assignments/count - Get assignment count
  getAssignmentCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.leadAssignmentService.getAssignmentCount();
      res.status(200).json({
        success: true,
        message: "Assignment count retrieved successfully",
        count: count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving assignment count",
        error: error.message,
      });
    }
  };

  // POST /api/lead-assignments/upsert - Create or update assignment based on leadId
  upsertAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const assignmentData = req.body;

      // Validate leadId is provided
      if (!assignmentData.leadId) {
        res.status(400).json({
          success: false,
          message: "Lead ID is required",
        });
        return;
      }

      // Add assignedBy from authenticated user if available
      if (req.user && !assignmentData.assignedBy) {
        assignmentData.assignedBy = req.user.id;
      }

      // Add createdBy from authenticated user if available
      if (req.user && !assignmentData.createdBy) {
        assignmentData.createdBy = req.user.username || req.user.fullname;
      }

      const result = await this.leadAssignmentService.upsertAssignment(assignmentData);

      res.status(result.isUpdate ? 200 : 201).json({
        success: true,
        message: result.isUpdate
          ? "Lead assignment updated successfully"
          : "Lead assignment created successfully",
        data: result.assignment,
      });
    } catch (error: any) {
      if (
        error.message.includes("required") ||
        error.message.includes("not found") ||
        error.message.includes("Failed to")
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error upserting lead assignment",
          error: error.message,
        });
      }
    }
  };
}


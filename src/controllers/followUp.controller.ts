import { Request, Response } from "express";
import { FollowUpService } from "../services/followUp.service";

export class FollowUpController {
  private followUpService: FollowUpService;

  constructor() {
    this.followUpService = new FollowUpService();
  }

  // GET /api/followups - Get all follow-up types
  getAllFollowUps = async (req: Request, res: Response): Promise<void> => {
    try {
      const followUps = await this.followUpService.getAllFollowUps();
      res.status(200).json({
        success: true,
        message: "Follow-up types retrieved successfully",
        data: followUps,
        count: followUps.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving follow-up types",
        error: error.message,
      });
    }
  };

  // GET /api/followups/:id - Get follow-up type by ID
  getFollowUpById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid follow-up type ID",
        });
        return;
      }

      const followUp = await this.followUpService.getFollowUpById(id);
      res.status(200).json({
        success: true,
        message: "Follow-up type retrieved successfully",
        data: followUp,
      });
    } catch (error: any) {
      if (error.message === "Follow-up type not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error retrieving follow-up type",
          error: error.message,
        });
      }
    }
  };

  // POST /api/followups - Create new follow-up type
  createFollowUp = async (req: Request, res: Response): Promise<void> => {
    try {
      const followUpData = req.body;
      const followUp = await this.followUpService.createFollowUp(followUpData);
      res.status(201).json({
        success: true,
        message: "Follow-up type created successfully",
        data: followUp,
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
          message: "Error creating follow-up type",
          error: error.message,
        });
      }
    }
  };

  // PUT /api/followups/:id - Update follow-up type
  updateFollowUp = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid follow-up type ID",
        });
        return;
      }

      const followUpData = req.body;
      const followUp = await this.followUpService.updateFollowUp(id, followUpData);
      res.status(200).json({
        success: true,
        message: "Follow-up type updated successfully",
        data: followUp,
      });
    } catch (error: any) {
      if (error.message === "Follow-up type not found") {
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
          message: "Error updating follow-up type",
          error: error.message,
        });
      }
    }
  };

  // DELETE /api/followups/:id - Delete follow-up type (soft delete)
  deleteFollowUp = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid follow-up type ID",
        });
        return;
      }

      await this.followUpService.deleteFollowUp(id);
      res.status(200).json({
        success: true,
        message: "Follow-up type deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Follow-up type not found") {
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
          message: "Error deleting follow-up type",
          error: error.message,
        });
      }
    }
  };

  // GET /api/followups/count - Get follow-up type count
  getFollowUpCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.followUpService.getFollowUpCount();
      res.status(200).json({
        success: true,
        message: "Follow-up type count retrieved successfully",
        count: count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving follow-up type count",
        error: error.message,
      });
    }
  };
}


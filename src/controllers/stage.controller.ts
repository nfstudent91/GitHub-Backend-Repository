import { Request, Response } from "express";
import { StageService } from "../services/stage.service";

export class StageController {
  private stageService: StageService;

  constructor() {
    this.stageService = new StageService();
  }

  // GET /api/stages - Get all stages
  getAllStages = async (req: Request, res: Response): Promise<void> => {
    try {
      const stages = await this.stageService.getAllStages();
      res.status(200).json({
        success: true,
        message: "Stages retrieved successfully",
        data: stages,
        // count: stages.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving stages",
        error: error.message,
      });
    }
  };

  // GET /api/stages/:id - Get stage by ID
  getStageById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid stage ID",
        });
        return;
      }

      const stage = await this.stageService.getStageById(id);
      res.status(200).json({
        success: true,
        message: "Stage retrieved successfully",
        data: stage,
      });
    } catch (error: any) {
      if (error.message === "Stage not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error retrieving stage",
          error: error.message,
        });
      }
    }
  };

  // POST /api/stages - Create new stage
  createStage = async (req: Request, res: Response): Promise<void> => {
    try {
      const stageData = req.body;
      const stage = await this.stageService.createStage(stageData);
      res.status(201).json({
        success: true,
        message: "Stage created successfully",
        data: stage,
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
          message: "Error creating stage",
          error: error.message,
        });
      }
    }
  };

  // PUT /api/stages/:id - Update stage
  updateStage = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid stage ID",
        });
        return;
      }

      const stageData = req.body;
      const stage = await this.stageService.updateStage(id, stageData);
      res.status(200).json({
        success: true,
        message: "Stage updated successfully",
        data: stage,
      });
    } catch (error: any) {
      if (error.message === "Stage not found") {
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
          message: "Error updating stage",
          error: error.message,
        });
      }
    }
  };

  // DELETE /api/stages/:id - Delete stage (soft delete)
  deleteStage = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid stage ID",
        });
        return;
      }

      await this.stageService.deleteStage(id);
      res.status(200).json({
        success: true,
        message: "Stage deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Stage not found") {
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
          message: "Error deleting stage",
          error: error.message,
        });
      }
    }
  };

  // GET /api/stages/count - Get stage count
  getStageCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.stageService.getStageCount();
      res.status(200).json({
        success: true,
        message: "Stage count retrieved successfully",
        count: count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving stage count",
        error: error.message,
      });
    }
  };
}


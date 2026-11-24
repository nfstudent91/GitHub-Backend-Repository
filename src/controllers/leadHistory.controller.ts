import { Request, Response } from "express";
import { LeadHistoryService } from "../services/leadHistory.service";

export class LeadHistoryController {
  private leadHistoryService: LeadHistoryService;

  constructor() {
    this.leadHistoryService = new LeadHistoryService();
  }

  // GET /api/lead-histories - Get all histories
  getAllHistories = async (req: Request, res: Response): Promise<void> => {
    try {
      const histories = await this.leadHistoryService.getAllHistories();
      res.status(200).json({
        success: true,
        message: "Lead histories retrieved successfully",
        data: histories,
        count: histories.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving lead histories",
        error: error.message,
      });
    }
  };

  // GET /api/lead-histories/:id - Get history by ID
  getHistoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid history ID",
        });
        return;
      }

      const history = await this.leadHistoryService.getHistoryById(id);
      res.status(200).json({
        success: true,
        message: "Lead history retrieved successfully",
        data: history,
      });
    } catch (error: any) {
      if (error.message === "Lead history not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error retrieving lead history",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-histories/lead/:leadId - Get histories by lead ID
  getHistoriesByLeadId = async (req: Request, res: Response): Promise<void> => {
    try {
      const leadId = parseInt(req.params.leadId);
      
      if (isNaN(leadId)) {
        res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
        return;
      }

      const histories = await this.leadHistoryService.getHistoriesByLeadId(leadId);
      res.status(200).json({
        success: true,
        message: "Lead histories retrieved successfully",
        data: histories,
        count: histories.length,
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
          message: "Error retrieving lead histories",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-histories/user/:userId/assigned-to - Get histories by assigned to user ID
  getHistoriesByAssignedTo = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      const histories = await this.leadHistoryService.getHistoriesByAssignedTo(userId);
      res.status(200).json({
        success: true,
        message: "Lead histories retrieved successfully",
        data: histories,
        count: histories.length,
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
          message: "Error retrieving lead histories",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-histories/user/:userId/assigned-by - Get histories by assigned by user ID
  getHistoriesByAssignedBy = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      const histories = await this.leadHistoryService.getHistoriesByAssignedBy(userId);
      res.status(200).json({
        success: true,
        message: "Lead histories retrieved successfully",
        data: histories,
        count: histories.length,
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
          message: "Error retrieving lead histories",
          error: error.message,
        });
      }
    }
  };

  // POST /api/lead-histories - Create new history
  createHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const historyData = req.body;
      
      // Add assignedBy from authenticated user if available
      if (req.user && !historyData.assignedBy) {
        historyData.assignedBy = req.user.id;
      }

      const history = await this.leadHistoryService.createHistory(historyData);
      res.status(201).json({
        success: true,
        message: "Lead history created successfully",
        data: history,
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
          message: "Error creating lead history",
          error: error.message,
        });
      }
    }
  };

  // PUT /api/lead-histories/:id - Update history
  updateHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid history ID",
        });
        return;
      }

      const historyData = req.body;
      const history = await this.leadHistoryService.updateHistory(id, historyData);
      res.status(200).json({
        success: true,
        message: "Lead history updated successfully",
        data: history,
      });
    } catch (error: any) {
      if (error.message === "Lead history not found" || error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error updating lead history",
          error: error.message,
        });
      }
    }
  };

  // DELETE /api/lead-histories/:id - Delete history
  deleteHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid history ID",
        });
        return;
      }

      await this.leadHistoryService.deleteHistory(id);
      res.status(200).json({
        success: true,
        message: "Lead history deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Lead history not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error deleting lead history",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-histories/count - Get history count
  getHistoryCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.leadHistoryService.getHistoryCount();
      res.status(200).json({
        success: true,
        message: "History count retrieved successfully",
        count: count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving history count",
        error: error.message,
      });
    }
  };
}


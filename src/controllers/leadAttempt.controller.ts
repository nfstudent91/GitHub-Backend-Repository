import { Request, Response } from "express";
import { LeadAttemptService } from "../services/leadAttempt.service";
import { FollowUpService } from "../services";

export class LeadAttemptController {
  private leadAttemptService: LeadAttemptService;
  private followUpService: FollowUpService;

  constructor() {
    this.leadAttemptService = new LeadAttemptService();
    this.followUpService = new FollowUpService();
  }

  // GET /api/lead-attempts - Get all attempts
  getAllAttempts = async (req: Request, res: Response): Promise<void> => {
    try {
      const attempts = await this.leadAttemptService.getAllAttempts();
      res.status(200).json({
        success: true,
        message: "Lead attempts retrieved successfully",
        data: attempts,
        count: attempts.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving lead attempts",
        error: error.message,
      });
    }
  };

  // GET /api/lead-attempts/:id - Get attempt by ID
  getAttemptById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid attempt ID",
        });
        return;
      }

      const attempt = await this.leadAttemptService.getAttemptById(id);
      res.status(200).json({
        success: true,
        message: "Lead attempt retrieved successfully",
        data: attempt,
      });
    } catch (error: any) {
      if (error.message === "Lead attempt not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error retrieving lead attempt",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-attempts/lead/:leadId - Get attempts by lead ID
  getAttemptsByLeadId = async (req: Request, res: Response): Promise<void> => {
    try {
      const leadId = parseInt(req.params.leadId);

      if (isNaN(leadId)) {
        res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
        return;
      }

      const result = await this.leadAttemptService.getAttemptsByLeadId(leadId);

      // Restructure response: lead object with attempt details and followUpTypes
      let leadData: any = null;
      const followUpTypes: any[] = [];
      console.log("result.data = ", result.data)
      // for (const attempt of result.data) {
      //   // Extract lead from first attempt and add attempt details
      //   if (!leadData && attempt.lead) {
      //     leadData = {
      //       ...attempt.lead,
      //       remarks: attempt.remarks,
      //       outcome: attempt.outcome,
      //       callTime: attempt.callTime,
      //       duration: attempt.duration,
      //       scheduledTime: attempt.scheduledTime,
      //     };
      //   }

      //   // Add follow-up type (id and name only) to followUpTypes array
      //   if (attempt.followType) {
      //     followUpTypes.push({
      //       id: attempt.followType.id,
      //       name: attempt.followType.name,
      //     });
      //   }
      // }

      // Add followUpTypes array to lead object
      // if (leadData) {
      //   leadData.followUpTypes = followUpTypes;
      // }

      res.status(200).json({
        success: true,
        message: "Lead attempts retrieved successfully",
        data: result.data,
        count: result.data.length,
        callStatistics: result.callStatistics,
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
          message: "Error retrieving lead attempts",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-attempts/follow-type/:followTypeId - Get attempts by follow-up type ID
  getAttemptsByFollowTypeId = async (req: Request, res: Response): Promise<void> => {
    try {
      const followTypeId = parseInt(req.params.followTypeId);

      if (isNaN(followTypeId)) {
        res.status(400).json({
          success: false,
          message: "Invalid follow-up type ID",
        });
        return;
      }

      const attempts = await this.leadAttemptService.getAttemptsByFollowTypeId(followTypeId);
      res.status(200).json({
        success: true,
        message: "Lead attempts retrieved successfully",
        data: attempts,
        count: attempts.length,
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
          message: "Error retrieving lead attempts",
          error: error.message,
        });
      }
    }
  };

  // POST /api/lead-attempts - Create new attempt(s)
  createAttempt = async (req: Request, res: Response): Promise<void> => {
    try {
      const { leadId, followType, remarks, ...rest } = req.body;

      // Add createdBy from authenticated user if available
      const createdBy = req.user?.username || req.user?.fullname || rest.createdBy;

      const existFollowType = await this.followUpService.findByName(followType);

      // Create attempts for each followTypeId
      const createdAttempts = [];
      
      // for (const ftId of followTypeIds) {
      const attemptData = {
        ...rest,
        leadId: parseInt(leadId, 10),
        followTypeId: parseInt(existFollowType.id, 10),
        remarks: remarks || rest.notes,
        createdBy,
      };
      const attempt = await this.leadAttemptService.createAttempt(attemptData);
      createdAttempts.push(attempt);
      // }

      res.status(201).json({
        success: true,
        message: `Lead attempt(s) created successfully`,
        data: createdAttempts.length === 1 ? createdAttempts[0] : createdAttempts,
        count: createdAttempts.length,
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
          message: "Error creating lead attempt",
          error: error.message,
        });
      }
    }
  };

  // PUT /api/lead-attempts/:id - Update attempt
  updateAttempt = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid attempt ID",
        });
        return;
      }

      const attemptData = req.body;
      const attempt = await this.leadAttemptService.updateAttempt(id, attemptData);
      res.status(200).json({
        success: true,
        message: "Lead attempt updated successfully",
        data: attempt,
      });
    } catch (error: any) {
      if (error.message === "Lead attempt not found" || error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error updating lead attempt",
          error: error.message,
        });
      }
    }
  };

  // DELETE /api/lead-attempts/:id - Delete attempt
  deleteAttempt = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid attempt ID",
        });
        return;
      }

      await this.leadAttemptService.deleteAttempt(id);
      res.status(200).json({
        success: true,
        message: "Lead attempt deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Lead attempt not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error deleting lead attempt",
          error: error.message,
        });
      }
    }
  };

  // GET /api/lead-attempts/count - Get attempt count
  getAttemptCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.leadAttemptService.getAttemptCount();
      res.status(200).json({
        success: true,
        message: "Attempt count retrieved successfully",
        count: count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving attempt count",
        error: error.message,
      });
    }
  };

  // GET /api/lead-attempts/dashboard - Get dashboard statistics
  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboard = await this.leadAttemptService.getDashboardStats();
      res.status(200).json({
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: dashboard,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving dashboard statistics",
        error: error.message,
      });
    }
  };
}


import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }

    getAdvisorDashboard = async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                return res.status(400).json({ message: "Invalid user ID" });
            }

            const stats = await this.dashboardService.getAdvisorStats(userId);
            return res.status(200).json(stats);
        } catch (error: any) {
            console.error("Error fetching advisor dashboard:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };

    getTelecallerDashboard = async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                return res.status(400).json({ message: "Invalid user ID" });
            }

            const stats = await this.dashboardService.getTelecallerStats(userId);
            return res.status(200).json(stats);
        } catch (error: any) {
            console.error("Error fetching telecaller dashboard:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };

    getProcessingDashboard = async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                return res.status(400).json({ message: "Invalid user ID" });
            }

            const stats = await this.dashboardService.getProcessingStats(userId);
            return res.status(200).json({
                success: true,
                message: "Processing dashboard data retrieved successfully",
                data: stats,
            });
        } catch (error: any) {
            console.error("Error fetching processing dashboard:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };

    getAdminDashboard = async (req: Request, res: Response) => {
        try {
            const stats = await this.dashboardService.getAdminStats();
            return res.status(200).json({
                success: true,
                message: "Admin dashboard data retrieved successfully",
                data: stats,
            });
        } catch (error: any) {
            console.error("Error fetching admin dashboard:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };
}

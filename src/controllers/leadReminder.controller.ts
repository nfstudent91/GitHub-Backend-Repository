import { Request, Response } from "express";
import { LeadReminderService } from "../services/leadReminder.service";
import { ReminderStatus } from "../entities/LeadReminder";

export class LeadReminderController {
    private leadReminderService: LeadReminderService;

    constructor() {
        this.leadReminderService = new LeadReminderService();
    }

    // GET /api/lead-reminders - Get all reminders
    getAllReminders = async (req: Request, res: Response): Promise<void> => {
        try {
            const reminders = await this.leadReminderService.getAllReminders();
            res.status(200).json({
                success: true,
                message: "Reminders retrieved successfully",
                data: reminders,
                count: reminders.length,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error retrieving reminders",
                error: error.message,
            });
        }
    };

    // GET /api/lead-reminders/:id - Get reminder by ID
    getReminderById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid reminder ID",
                });
                return;
            }

            const reminder = await this.leadReminderService.getReminderById(id);
            res.status(200).json({
                success: true,
                message: "Reminder retrieved successfully",
                data: reminder,
            });
        } catch (error: any) {
            if (error.message === "Reminder not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error retrieving reminder",
                    error: error.message,
                });
            }
        }
    };

    // GET /api/lead-reminders/lead/:leadId - Get reminders by lead ID
    getRemindersByLeadId = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const leadId = parseInt(req.params.leadId);

            if (isNaN(leadId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid lead ID",
                });
                return;
            }

            const reminders =
                await this.leadReminderService.getRemindersByLeadId(leadId);
            res.status(200).json({
                success: true,
                message: "Reminders retrieved successfully",
                data: reminders,
                count: reminders.length,
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
                    message: "Error retrieving reminders",
                    error: error.message,
                });
            }
        }
    };

    // GET /api/lead-reminders/user/:userId - Get reminders by user ID
    getRemindersByUserId = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
                return;
            }

            const reminders =
                await this.leadReminderService.getRemindersByUserId(userId);
            res.status(200).json({
                success: true,
                message: "Reminders retrieved successfully",
                data: reminders,
                count: reminders.length,
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
                    message: "Error retrieving reminders",
                    error: error.message,
                });
            }
        }
    };

    // GET /api/lead-reminders/status/:status - Get reminders by status
    getRemindersByStatus = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const status = req.params.status as ReminderStatus;

            if (!Object.values(ReminderStatus).includes(status)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid status. Must be: pending, completed, or dismissed",
                });
                return;
            }

            const reminders =
                await this.leadReminderService.getRemindersByStatus(status);
            res.status(200).json({
                success: true,
                message: "Reminders retrieved successfully",
                data: reminders,
                count: reminders.length,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error retrieving reminders",
                error: error.message,
            });
        }
    };

    // GET /api/lead-reminders/pending - Get pending reminders
    getPendingReminders = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const reminders = await this.leadReminderService.getPendingReminders();
            res.status(200).json({
                success: true,
                message: "Pending reminders retrieved successfully",
                data: reminders,
                count: reminders.length,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error retrieving pending reminders",
                error: error.message,
            });
        }
    };

    // GET /api/lead-reminders/upcoming - Get upcoming reminders
    getUpcomingReminders = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const userId = req.query.userId
                ? parseInt(req.query.userId as string)
                : undefined;

            if (userId && isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
                return;
            }

            const reminders =
                await this.leadReminderService.getUpcomingReminders(userId);
            res.status(200).json({
                success: true,
                message: "Upcoming reminders retrieved successfully",
                data: reminders,
                count: reminders.length,
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
                    message: "Error retrieving upcoming reminders",
                    error: error.message,
                });
            }
        }
    };

    // GET /api/lead-reminders/overdue - Get overdue reminders
    getOverdueReminders = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const userId = req.query.userId
                ? parseInt(req.query.userId as string)
                : undefined;

            if (userId && isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
                return;
            }

            const reminders =
                await this.leadReminderService.getOverdueReminders(userId);
            res.status(200).json({
                success: true,
                message: "Overdue reminders retrieved successfully",
                data: reminders,
                count: reminders.length,
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
                    message: "Error retrieving overdue reminders",
                    error: error.message,
                });
            }
        }
    };

    // POST /api/lead-reminders - Create new reminder
    createReminder = async (req: Request, res: Response): Promise<void> => {
        try {
            const reminderData = req.body;

            // Add createdBy from authenticated user if available
            if (req.user && !reminderData.createdBy) {
                reminderData.createdBy = req.user.username || req.user.fullname;
            }

            const reminder = await this.leadReminderService.createReminder(reminderData);
            res.status(201).json({
                success: true,
                message: "Reminder created successfully",
                data: reminder,
            });
        } catch (error: any) {
            if (
                error.message.includes("required") ||
                error.message.includes("not found") ||
                error.message.includes("must be in the future")
            ) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error creating reminder",
                    error: error.message,
                });
            }
        }
    };

    // PUT /api/lead-reminders/:id - Update reminder
    updateReminder = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid reminder ID",
                });
                return;
            }

            const reminderData = req.body;
            const reminder = await this.leadReminderService.updateReminder(
                id,
                reminderData
            );
            res.status(200).json({
                success: true,
                message: "Reminder updated successfully",
                data: reminder,
            });
        } catch (error: any) {
            if (
                error.message === "Reminder not found" ||
                error.message.includes("not found")
            ) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else if (error.message.includes("must be in the future")) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error updating reminder",
                    error: error.message,
                });
            }
        }
    };

    // DELETE /api/lead-reminders/:id - Delete reminder
    deleteReminder = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid reminder ID",
                });
                return;
            }

            await this.leadReminderService.deleteReminder(id);
            res.status(200).json({
                success: true,
                message: "Reminder deleted successfully",
            });
        } catch (error: any) {
            if (error.message === "Reminder not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error deleting reminder",
                    error: error.message,
                });
            }
        }
    };

    // PUT /api/lead-reminders/:id/complete - Mark reminder as completed
    markAsCompleted = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid reminder ID",
                });
                return;
            }

            const reminder = await this.leadReminderService.markAsCompleted(id);
            res.status(200).json({
                success: true,
                message: "Reminder marked as completed",
                data: reminder,
            });
        } catch (error: any) {
            if (error.message === "Reminder not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error marking reminder as completed",
                    error: error.message,
                });
            }
        }
    };

    // PUT /api/lead-reminders/:id/dismiss - Mark reminder as dismissed
    markAsDismissed = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid reminder ID",
                });
                return;
            }

            const reminder = await this.leadReminderService.markAsDismissed(id);
            res.status(200).json({
                success: true,
                message: "Reminder marked as dismissed",
                data: reminder,
            });
        } catch (error: any) {
            if (error.message === "Reminder not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error marking reminder as dismissed",
                    error: error.message,
                });
            }
        }
    };

    // GET /api/lead-reminders/count - Get reminder count
    getReminderCount = async (req: Request, res: Response): Promise<void> => {
        try {
            const count = await this.leadReminderService.getReminderCount();
            res.status(200).json({
                success: true,
                message: "Reminder count retrieved successfully",
                count: count,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error retrieving reminder count",
                error: error.message,
            });
        }
    };
}

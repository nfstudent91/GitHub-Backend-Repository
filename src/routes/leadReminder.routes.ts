import { Router } from "express";
import { LeadReminderController } from "../controllers/leadReminder.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const leadReminderController = new LeadReminderController();

// Apply authentication middleware to all reminder routes
router.use(authMiddleware);

// GET /api/lead-reminders/count - Get reminder count (must be before /:id)
router.get("/count", leadReminderController.getReminderCount);

// GET /api/lead-reminders/pending - Get pending reminders (must be before /:id)
router.get("/pending", leadReminderController.getPendingReminders);

// GET /api/lead-reminders/upcoming - Get upcoming reminders (must be before /:id)
router.get("/upcoming", leadReminderController.getUpcomingReminders);

// GET /api/lead-reminders/overdue - Get overdue reminders (must be before /:id)
router.get("/overdue", leadReminderController.getOverdueReminders);

// GET /api/lead-reminders/lead/:leadId - Get reminders by lead ID (must be before /:id)
router.get("/lead/:leadId", leadReminderController.getRemindersByLeadId);

// GET /api/lead-reminders/user/:userId - Get reminders by user ID (must be before /:id)
router.get("/user/:userId", leadReminderController.getRemindersByUserId);

// GET /api/lead-reminders/status/:status - Get reminders by status (must be before /:id)
router.get("/status/:status", leadReminderController.getRemindersByStatus);

// GET /api/lead-reminders - Get all reminders
router.get("/", leadReminderController.getAllReminders);

// GET /api/lead-reminders/:id - Get reminder by ID
router.get("/:id", leadReminderController.getReminderById);

// POST /api/lead-reminders - Create new reminder
router.post("/", leadReminderController.createReminder);

// PUT /api/lead-reminders/:id/complete - Mark reminder as completed
router.put("/:id/complete", leadReminderController.markAsCompleted);

// PUT /api/lead-reminders/:id/dismiss - Mark reminder as dismissed
router.put("/:id/dismiss", leadReminderController.markAsDismissed);

// PUT /api/lead-reminders/:id - Update reminder
router.put("/:id", leadReminderController.updateReminder);

// DELETE /api/lead-reminders/:id - Delete reminder
router.delete("/:id", leadReminderController.deleteReminder);

export default router;

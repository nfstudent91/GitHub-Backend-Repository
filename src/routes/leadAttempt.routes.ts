import { Router } from "express";
import { LeadAttemptController } from "../controllers/leadAttempt.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const leadAttemptController = new LeadAttemptController();

// Apply authentication middleware to all attempt routes
router.use(authMiddleware);

// GET /api/lead-attempts/count - Get attempt count (must be before /:id)
router.get("/count", leadAttemptController.getAttemptCount);

// GET /api/lead-attempts/dashboard - Get dashboard statistics (must be before /:id)
router.get("/dashboard", leadAttemptController.getDashboard);

// GET /api/lead-attempts/lead/:leadId - Get attempts by lead ID (must be before /:id)
router.get("/lead/:leadId", leadAttemptController.getAttemptsByLeadId);

// GET /api/lead-attempts/follow-type/:followTypeId - Get attempts by follow-up type ID (must be before /:id)
router.get("/follow-type/:followTypeId", leadAttemptController.getAttemptsByFollowTypeId);

// GET /api/lead-attempts - Get all attempts
router.get("/", leadAttemptController.getAllAttempts);

// GET /api/lead-attempts/:id - Get attempt by ID
router.get("/:id", leadAttemptController.getAttemptById);

// POST /api/lead-attempts - Create new attempt
router.post("/", leadAttemptController.createAttempt);

// PUT /api/lead-attempts/:id - Update attempt
router.put("/:id", leadAttemptController.updateAttempt);

// DELETE /api/lead-attempts/:id - Delete attempt
router.delete("/:id", leadAttemptController.deleteAttempt);

export default router;


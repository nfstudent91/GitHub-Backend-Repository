import { Router } from "express";
import { LeadAssignmentController } from "../controllers/leadAssignment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const leadAssignmentController = new LeadAssignmentController();

// Apply authentication middleware to all assignment routes
router.use(authMiddleware);

// GET /api/lead-assignments/count - Get assignment count (must be before /:id)
router.get("/count", leadAssignmentController.getAssignmentCount);

// GET /api/lead-assignments/lead/:leadId/current - Get current assignment (must be before /lead/:leadId)
router.get("/lead/:leadId/current", leadAssignmentController.getCurrentAssignment);

// GET /api/lead-assignments/lead/:leadId - Get assignments by lead ID (must be before /:id)
router.get("/lead/:leadId", leadAssignmentController.getAssignmentsByLeadId);

// GET /api/lead-assignments/user/:userId - Get assignments by assigned to user ID (must be before /:id)
router.get("/user/:userId", leadAssignmentController.getAssignmentsByAssignedTo);

// GET /api/lead-assignments - Get all assignments
router.get("/", leadAssignmentController.getAllAssignments);

// GET /api/lead-assignments/:id - Get assignment by ID
router.get("/:id", leadAssignmentController.getAssignmentById);

// POST /api/lead-assignments/upsert - Create or update assignment based on leadId
router.post("/upsert", leadAssignmentController.upsertAssignment);

// POST /api/lead-assignments - Create new assignment
router.post("/", leadAssignmentController.createAssignment);

// PUT /api/lead-assignments/:id - Update assignment
router.put("/:id", leadAssignmentController.updateAssignment);

// DELETE /api/lead-assignments/:id - Delete assignment
router.delete("/:id", leadAssignmentController.deleteAssignment);

export default router;


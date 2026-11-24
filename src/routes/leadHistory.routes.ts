import { Router } from "express";
import { LeadHistoryController } from "../controllers/leadHistory.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const leadHistoryController = new LeadHistoryController();

// Apply authentication middleware to all history routes
router.use(authMiddleware);

// GET /api/lead-histories/count - Get history count (must be before /:id)
router.get("/count", leadHistoryController.getHistoryCount);

// GET /api/lead-histories/lead/:leadId - Get histories by lead ID (must be before /:id)
router.get("/lead/:leadId", leadHistoryController.getHistoriesByLeadId);

// GET /api/lead-histories/user/:userId/assigned-to - Get histories by assigned to user ID (must be before /user/:userId/assigned-by)
router.get("/user/:userId/assigned-to", leadHistoryController.getHistoriesByAssignedTo);

// GET /api/lead-histories/user/:userId/assigned-by - Get histories by assigned by user ID (must be before /:id)
router.get("/user/:userId/assigned-by", leadHistoryController.getHistoriesByAssignedBy);

// GET /api/lead-histories - Get all histories
router.get("/", leadHistoryController.getAllHistories);

// GET /api/lead-histories/:id - Get history by ID
router.get("/:id", leadHistoryController.getHistoryById);

// POST /api/lead-histories - Create new history
router.post("/", leadHistoryController.createHistory);

// PUT /api/lead-histories/:id - Update history
router.put("/:id", leadHistoryController.updateHistory);

// DELETE /api/lead-histories/:id - Delete history
router.delete("/:id", leadHistoryController.deleteHistory);

export default router;


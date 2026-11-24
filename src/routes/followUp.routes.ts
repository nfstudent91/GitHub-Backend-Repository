import { Router } from "express";
import { FollowUpController } from "../controllers/followUp.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/roleAuth.middleware";

const router = Router();
const followUpController = new FollowUpController();

// Apply authentication and admin-only middleware to all follow-up routes
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/followups/count - Get follow-up type count (must be before /:id)
router.get("/count", followUpController.getFollowUpCount);

// GET /api/followups - Get all follow-up types
router.get("/", followUpController.getAllFollowUps);

// GET /api/followups/:id - Get follow-up type by ID
router.get("/:id", followUpController.getFollowUpById);

// POST /api/followups - Create new follow-up type
router.post("/", followUpController.createFollowUp);

// PUT /api/followups/:id - Update follow-up type
router.put("/:id", followUpController.updateFollowUp);

// DELETE /api/followups/:id - Delete follow-up type
router.delete("/:id", followUpController.deleteFollowUp);

export default router;


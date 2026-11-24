import { Router } from "express";
import { StageController } from "../controllers/stage.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/roleAuth.middleware";

const router = Router();
const stageController = new StageController();

// Apply authentication and admin-only middleware to all stage routes
router.use(authMiddleware);
// router.use(adminOnly);

// GET /api/stages/count - Get stage count (must be before /:id)
router.get("/count", stageController.getStageCount);

// GET /api/stages - Get all stages
router.get("/", stageController.getAllStages);

// GET /api/stages/:id - Get stage by ID
router.get("/:id", stageController.getStageById);

// POST /api/stages - Create new stage
router.post("/", stageController.createStage);

// PUT /api/stages/:id - Update stage
router.put("/:id", stageController.updateStage);

// DELETE /api/stages/:id - Delete stage
router.delete("/:id", stageController.deleteStage);

export default router;


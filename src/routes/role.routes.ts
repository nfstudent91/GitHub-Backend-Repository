import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/roleAuth.middleware";

const router = Router();
const roleController = new RoleController();

// Apply authentication and admin-only middleware to all role routes
// router.use(authMiddleware);
// router.use(adminOnly);

// GET /api/roles/count - Get role count (must be before /:id)
router.get("/count", roleController.getRoleCount);

// GET /api/roles - Get all roles
router.get("/", roleController.getAllRoles);

// GET /api/roles/:id - Get role by ID
router.get("/:id", roleController.getRoleById);

// POST /api/roles - Create new role
router.post("/", roleController.createRole);

// PUT /api/roles/:id - Update role
router.put("/:id", roleController.updateRole);

// DELETE /api/roles/:id - Delete role
router.delete("/:id", roleController.deleteRole);

export default router;


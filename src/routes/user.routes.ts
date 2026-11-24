import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { managerOrAdmin } from "../middleware/roleAuth.middleware";

const router = Router();
const userController = new UserController();


// Apply authentication and admin-only middleware to all user routes
router.use(authMiddleware);

// PUT /api/admin/users/:id/password - Update user password
router.put("/:id/password", userController.updatePassword);

router.get("/assignable", userController.getAssignableUsers);
router.use(managerOrAdmin);

// GET /api/admin/users/count - Get user count (must be before /:id)
router.get("/count", userController.getUserCount);

// GET /api/admin/users/assignable - Get all users except Admin (must be before /:id)

// GET /api/admin/users - Get all users
router.get("/", userController.getAllUsers);

// GET /api/admin/users/:id - Get user by ID
router.get("/:id", userController.getUserById);

// POST /api/admin/users - Create new user
router.post("/", userController.createUser);

// PUT /api/admin/users/:id - Update user
router.put("/:id", userController.updateUser);


// DELETE /api/admin/users/:id - Delete user
router.delete("/:id", userController.deleteUser);

export default router;


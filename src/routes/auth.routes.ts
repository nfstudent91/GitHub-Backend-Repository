import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

// Public routes (no authentication required)
// POST /api/auth/register - Register new user
router.post("/register", authController.register);

// POST /api/auth/login - Login user
router.post("/login", authController.login);

// POST /api/auth/forgot-password - Request password reset
router.post("/forgot-password", authController.forgotPassword);

// POST /api/auth/reset-password - Reset password using token
router.post("/reset-password", authController.resetPassword);

// Protected routes (authentication required)
// GET /api/auth/me - Get current user profile
router.get("/me", authMiddleware, authController.getProfile);

// POST /api/auth/logout - Logout user
router.post("/logout", authMiddleware, authController.logout);

// POST /api/auth/change-password - Change password (requires old password)
router.post("/change-password", authMiddleware, authController.changePassword);

// PUT /api/auth/users/:id/password - Update user password by ID (Admin/Manager)
router.put("/users/:id/password", authMiddleware, authController.updateUserPassword);

export default router;


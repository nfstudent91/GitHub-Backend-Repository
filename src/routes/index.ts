import { Router } from "express";
import authRoutes from "./auth.routes";
import roleRoutes from "./role.routes";
import stageRoutes from "./stage.routes";
import followUpRoutes from "./followUp.routes";
import leadRoutes from "./lead.routes";
import leadAssignmentRoutes from "./leadAssignment.routes";
import leadAttemptRoutes from "./leadAttempt.routes";
import leadHistoryRoutes from "./leadHistory.routes";
import leadReminderRoutes from "./leadReminder.routes";
import userRoutes from "./user.routes";

import formRoutes from "./form.routes";
import formFieldRoutes from "./form.field.routes";
import fieldOptionRoutes from "./field.option.routes";
import uploadRoutes from "./upload.routes";
import documentRoutes from "./document.routes";
import noteRoutes from "./note.routes";

import dashboardRoutes from "./dashboard.routes";
import agreementRoutes from "./agreement.routes";

const router = Router();

// Public routes
router.use("/auth", authRoutes);

// Protected routes (admin only)
router.use("/roles", roleRoutes);
router.use("/stages", stageRoutes);
router.use("/followups", followUpRoutes);
router.use("/admin/users", userRoutes);



// Form routes
router.use("/forms", formRoutes);
router.use("/form-fields", formFieldRoutes);
router.use("/field-options", fieldOptionRoutes);

// Upload routes
router.use("/upload", uploadRoutes);

// Protected routes (authenticated users)
router.use("/leads", leadRoutes);
router.use("/lead-assignments", leadAssignmentRoutes);
router.use("/lead-attempts", leadAttemptRoutes);
router.use("/lead-histories", leadHistoryRoutes);
router.use("/lead-reminders", leadReminderRoutes);
router.use("/documents", documentRoutes);
router.use("/notes", noteRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/agreement", agreementRoutes);

export default router;


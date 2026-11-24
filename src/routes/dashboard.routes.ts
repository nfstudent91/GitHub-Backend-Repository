import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
// import { authenticate } from "../middlewares/auth.middleware"; // Assuming auth middleware exists

const router = Router();
const dashboardController = new DashboardController();

// Add authentication middleware if required globally or per route
// router.use(authenticate);

router.get("/advisor/:userId", dashboardController.getAdvisorDashboard);
router.get("/telecaller/:userId", dashboardController.getTelecallerDashboard);
router.get("/processing/:userId", dashboardController.getProcessingDashboard);
router.get("/admin", dashboardController.getAdminDashboard);

export default router;

import { Router } from "express";
import { AgreementController } from "../controllers/agreement.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const agreementController = new AgreementController();

// All agreement routes require authentication
router.use(authMiddleware);

// GET /api/agreement/templates - List all available templates from S3
router.get("/templates", agreementController.listTemplates);

// GET /api/agreement/placeholders - Get all template placeholders
router.get("/placeholders", agreementController.getPlaceholders);

// POST /api/agreement/generate - Generate filled document
router.post("/generate", agreementController.generateDocument);

export default router;

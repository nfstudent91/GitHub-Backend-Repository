import { Router } from "express";
import { LeadController } from "../controllers/lead.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { managerOrAdmin } from "../middleware/roleAuth.middleware";

const router = Router();
const leadController = new LeadController();

// Meta Webhook Routes (PUBLIC - no authentication required)
router.get("/meta", leadController.metaWebhook);
router.post("/meta", leadController.metaWebhook);

// Website Webhook (PUBLIC FOR WORDPRESS - no authentication required) 
router.post("/website", leadController.websiteWebhook);

// Apply authentication middleware to all lead routes
router.use(authMiddleware);

// POST /api/leads/bulk-import - Bulk import leads from Excel/CSV
router.post(
  "/bulk-import",
  uploadMiddleware.single("file") as any,
  leadController.bulkImportLeads
);

// GET /api/leads/count - Get lead count (must be before /:id)
router.get("/count", leadController.getLeadCount);

// GET /api/leads/stage/:stageId/count - Get lead count by stage (must be before /stage/:stageId)
router.get("/stage/:stageId/count", leadController.getLeadCountByStage);

// GET /api/leads/stage/:stageId - Get leads by stage (must be before /:id)
router.get("/stage/:stageId", leadController.getLeadsByStage);

// GET /api/leads/payment-received - Get leads with 'PaymentReceived' stage (must be before /:id)
router.get("/payment-received", leadController.getPaymentReceivedLeads);

// GET /api/leads/search - Search leads with cursor-based pagination (must be before /:id)
router.get("/search", leadController.searchLeads);

// GET /api/leads/countries - Get unique countries (must be before /:id)
router.get("/countries", leadController.getUniqueCountries);

// GET /api/leads/visa-categories - Get unique visa categories (must be before /:id)
router.get("/visa-categories", leadController.getUniqueVisaCategories);

// GET /api/leads - Get all leads
router.get("/", leadController.getAllLeads);

// GET /api/leads/user/:userId - Get leads by user ID (must be before /:id)
router.get("/user/:userId", leadController.getLeadsByUserId);

// GET /api/leads/:id - Get lead by ID
router.get("/:id", leadController.getLeadById);

// POST /api/leads - Create new lead
router.post("/", leadController.createLead);

// PUT /api/leads/:id - Update lead
router.put("/:id", leadController.updateLead);

// DELETE /api/leads/:id - Delete lead
router.delete("/:id", managerOrAdmin, leadController.deleteLead);

export default router;
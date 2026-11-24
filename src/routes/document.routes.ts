import { Router } from "express";
import multer from "multer";

import { DocumentController } from "../controllers/document.controller";

const router = Router();
const documentController = new DocumentController();

// Multer setup for memory storage (for S3 upload)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Routes
// Direct-to-S3 upload flow (bypasses Amplify/CloudFront body limits)
router.post("/presigned-url", documentController.getPresignedUrl);
router.post("/register", documentController.registerDocumentFromS3);
router.put("/:id/register", documentController.updateDocumentFromS3);

// Legacy multer-based upload (kept for backward compatibility)
router.post("/upload", upload.single("file") as any, documentController.uploadDocument);
router.get("/search", documentController.searchDocuments);
router.get("/expiring", documentController.getExpiringDocuments);
router.get("/lead/:leadId", documentController.getDocumentsByLeadId);
router.put("/:id", upload.single("file") as any, documentController.updateDocument);
router.delete("/:id", documentController.deleteDocument);

export default router;
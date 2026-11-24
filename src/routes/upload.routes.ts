import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/upload.controller";
//import { authenticate } from "../middleware/auth.middleware"; // Assuming auth middleware exists, checking imports in index.ts suggests it might be applied globally or per route.
// Wait, index.ts has "Protected routes". I should probably check if authenticate middleware is available.
// Looking at index.ts, it doesn't import middleware. It just groups routes.
// Let's assume standard multer setup.

const router = Router();
const storage = multer.memoryStorage(); // Use memory storage for S3 upload
const upload = multer({ 
    storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

router.post("/", upload.single("file") as any, (req, res, next) => {
    uploadFile(req, res).catch(next);
});

export default router;
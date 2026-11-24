import { Request, Response } from "express";
import { DocumentService } from "../services/document.service";

export class DocumentController {
    private documentService: DocumentService;

    constructor() {
        this.documentService = new DocumentService();
    }

    uploadDocument = async (req: Request, res: Response): Promise<void> => {
        try {
            const file = req.file;
            const leadId = parseInt(req.body.leadId);
            const uploadedBy =
                (req as any).user?.username || (req as any).user?.fullname || "system";

            if (!file) {
                res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
                return;
            }

            if (isNaN(leadId)) {
                res.status(400).json({
                    success: false,
                    message: "Lead ID is required",
                });
                return;
            }

            const document = await this.documentService.uploadDocument(
                file,
                leadId,
                uploadedBy,
                req.body.documentLabel,
                req.body.expiryDate
            );

            res.status(201).json({
                success: true,
                message: "Document uploaded successfully",
                data: document,
            });
        } catch (error: any) {
            if (error.message === "Lead not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error uploading document",
                    error: error.message,
                });
            }
        }
    };

    getDocumentsByLeadId = async (req: Request, res: Response): Promise<void> => {
        try {
            const leadId = parseInt(req.params.leadId);

            if (isNaN(leadId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid lead ID",
                });
                return;
            }

            const documents = await this.documentService.getDocumentsByLeadId(leadId);

            res.status(200).json({
                success: true,
                message: "Documents retrieved successfully",
                data: documents,
                count: documents.length,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error retrieving documents",
                error: error.message,
            });
        }
    };

    // PUT /api/documents/:id - Update document (replace file or update metadata)
    updateDocument = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const file = req.file;

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid document ID",
                });
                return;
            }

            // If file is provided, re-upload logic could go here.
            // For now, we'll assume this endpoint is for updating metadata (e.g. filename)
            // or if file exists, we treat it as a replacement (implementation in Service would need expansion to delete old S3 file).

            // Current implementation: Update DB metadata only, or reject file replacement if not fully supported yet in Service.
            // If file is provided, passing it to service for upload and URL update
            const document = await this.documentService.updateDocument(id, req.body, file);

            res.status(200).json({
                success: true,
                message: "Document updated successfully",
                data: document,
            });

        } catch (error: any) {
            if (error.message === "Document not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error updating document",
                    error: error.message,
                });
            }
        }
    };

    deleteDocument = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid document ID",
                });
                return;
            }

            await this.documentService.deleteDocument(id);

            res.status(200).json({
                success: true,
                message: "Document deleted successfully",
            });
        } catch (error: any) {
            if (error.message === "Document not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error deleting document",
                    error: error.message,
                });
            }
        }
    };

    /**
     * POST /api/documents/presigned-url
     * Returns a short-lived pre-signed S3 PUT URL so the browser can upload
     * files directly to S3, avoiding the Amplify 6 MB body limit.
     */
    getPresignedUrl = async (req: Request, res: Response): Promise<void> => {
        try {
            const { fileName, contentType } = req.body;
            if (!fileName || !contentType) {
                res.status(400).json({ success: false, message: "fileName and contentType are required" });
                return;
            }
            const result = await this.documentService.getPresignedUploadUrl(fileName, contentType);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to generate upload URL", error: error.message });
        }
    };

    /**
     * POST /api/documents/register
     * Saves document metadata after the browser has already uploaded the file
     * directly to S3 via a pre-signed URL.
     */
    registerDocumentFromS3 = async (req: Request, res: Response): Promise<void> => {
        try {
            const { s3Key, leadId, documentLabel, expiryDate } = req.body;
            if (!s3Key || !leadId) {
                res.status(400).json({ success: false, message: "s3Key and leadId are required" });
                return;
            }
            const uploadedBy = (req as any).user?.username || (req as any).user?.fullname || "system";
            const document = await this.documentService.registerDocumentFromS3(
                s3Key,
                parseInt(leadId),
                uploadedBy,
                documentLabel,
                expiryDate
            );
            res.status(201).json({ success: true, message: "Document registered successfully", data: document });
        } catch (error: any) {
            if (error.message === "Lead not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(500).json({ success: false, message: "Error registering document", error: error.message });
            }
        }
    };

    /**
     * PUT /api/documents/:id/register
     * Updates document metadata after the browser has uploaded a replacement
     * file directly to S3 via a pre-signed URL.
     */
    updateDocumentFromS3 = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid document ID" });
                return;
            }
            const { s3Key, expiryDate } = req.body;
            const data: any = {};
            if (expiryDate) data.expiryDate = expiryDate;
            const document = await this.documentService.updateDocumentFromS3(id, s3Key, data);
            res.status(200).json({ success: true, message: "Document updated successfully", data: document });
        } catch (error: any) {
            if (error.message === "Document not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(500).json({ success: false, message: "Error updating document", error: error.message });
            }
        }
    };

    getExpiringDocuments = async (req: Request, res: Response): Promise<void> => {
        try {
            const searchText = req.query.searchText as string;
            const documents = await this.documentService.getExpiringDocuments(searchText);
            res.status(200).json({
                success: true,
                message: "Expiring documents retrieved successfully",
                data: documents,
                count: documents.length,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error retrieving expiring documents",
                error: error.message,
            });
        }
    };

    searchDocuments = async (req: Request, res: Response): Promise<void> => {
        try {
            const searchText = req.query.searchText as string;

            const documents = await this.documentService.searchDocuments(searchText);

            res.status(200).json({
                success: true,
                message: "Documents retrieved successfully",
                data: documents,
                count: documents.length,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error searching documents",
                error: error.message,
            });
        }
    };
}
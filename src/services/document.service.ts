import { DocumentRepository } from "../repositories/document.repository";
import { DocumentUpload } from "../entities/DocumentUpload";
import { S3Service } from "./s3.service";
import { LeadRepository } from "../repositories/lead.repository";

export class DocumentService {
    private documentRepository: DocumentRepository;
    private s3Service: S3Service;
    private leadRepository: LeadRepository;

    constructor() {
        this.documentRepository = new DocumentRepository();
        this.s3Service = new S3Service();
        this.leadRepository = new LeadRepository();
    }

    private extractS3Key(url: string): string | null {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            // .pathname gives everything after the host (e.g., '/folder/file.jpg')
            // .substring(1) removes the leading slash required for the S3 Key
            return decodeURIComponent(urlObj.pathname.substring(1));
        } catch (error) {
            console.error("Failed to parse S3 URL:", url);
            return null;
        }
    }

    async uploadDocument(
        file: Express.Multer.File,
        leadId: number,
        uploadedBy: string,
        documentLabel?: string,
        expiryDate?: string
    ): Promise<DocumentUpload> {
        // Verify lead exists
        const lead = await this.leadRepository.findById(leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        // Upload to S3
        let s3Url: string;
        try {
            s3Url = await this.s3Service.uploadFile(file);
        } catch (error) {
            throw new Error("Failed to upload file to storage");
        }

        // Save metadata to DB
        const documentData: Partial<DocumentUpload> = {
            url: s3Url,
            leadId: leadId,
            uploadedBy: uploadedBy,
            documentLabel: documentLabel,
            expiryDate: expiryDate,
        };

        return await this.documentRepository.create(documentData);
    }

    async getDocumentsByLeadId(leadId: number): Promise<DocumentUpload[]> {
        return await this.documentRepository.findAllByLeadId(leadId);
    }

    async getExpiringDocuments(searchText?: string): Promise<DocumentUpload[]> {
        return await this.documentRepository.findExpiringWithinWeek(searchText);
    }

    async updateDocument(
        id: number,
        data: Partial<DocumentUpload>,
        file?: Express.Multer.File
    ): Promise<DocumentUpload | null> {
        const document = await this.documentRepository.findById(id);
        if (!document) {
            throw new Error("Document not found");
        }

        if (file) {
            try {
                // If a new file is uploaded, remove the old version from S3 to save storage
                if (document.url) {
                    const oldKey = this.extractS3Key(document.url);
                    if (oldKey) {
                        try {
                            await this.s3Service.deleteFile(oldKey);
                        } catch (s3Error) {
                            console.warn("Minor: Failed to delete previous file from S3 during update. Storage might contain an orphan file.", s3Error);
                        }
                    }
                }

                const s3Url = await this.s3Service.uploadFile(file);
                data.url = s3Url;
            } catch (error) {
                throw new Error("Failed to upload new file to storage");
            }
        }

        return await this.documentRepository.update(id, data);
    }

    async deleteDocument(id: number): Promise<boolean> {
        const document = await this.documentRepository.findById(id);
        if (!document) {
            throw new Error("Document not found");
        }

        // Physically delete the file from AWS S3
        if (document.url) {
            const key = this.extractS3Key(document.url);
            if (key) {
                try {
                    await this.s3Service.deleteFile(key);
                } catch (s3Error) {
                    // We log the error but continue to delete the DB record to avoid 'orphaned' CRM entries
                    console.error(`S3 Deletion failed for key ${key}, proceeding with DB removal:`, s3Error);
                }
            }
        }

        return await this.documentRepository.delete(id);
    }

    async searchDocuments(searchText: string): Promise<DocumentUpload[]> {
        return await this.documentRepository.search(searchText);
    }

    /**
     * Generate a pre-signed S3 upload URL so the browser can upload directly,
     * bypassing the Amplify/CloudFront body-size limit.
     */
    async getPresignedUploadUrl(
        fileName: string,
        contentType: string
    ): Promise<{ uploadUrl: string; s3Key: string; publicUrl: string }> {
        return this.s3Service.getPresignedUploadUrl(fileName, contentType);
    }

    /**
     * Register a document whose file was already uploaded directly to S3 by the browser.
     * Accepts the s3Key instead of a file buffer.
     */
    async registerDocumentFromS3(
        s3Key: string,
        leadId: number,
        uploadedBy: string,
        documentLabel?: string,
        expiryDate?: string
    ): Promise<DocumentUpload> {
        const lead = await this.leadRepository.findById(leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        const url = this.s3Service.getPublicUrl(s3Key);

        const documentData: Partial<DocumentUpload> = {
            url,
            leadId,
            uploadedBy,
            documentLabel,
            expiryDate,
        };

        return await this.documentRepository.create(documentData);
    }

    /**
     * Update a document whose replacement file was uploaded directly to S3 by the browser.
     */
    async updateDocumentFromS3(
        id: number,
        s3Key: string | undefined,
        data: Partial<DocumentUpload>
    ): Promise<DocumentUpload | null> {
        const document = await this.documentRepository.findById(id);
        if (!document) {
            throw new Error("Document not found");
        }

        if (s3Key) {
            // Delete old S3 file
            if (document.url) {
                const oldKey = this.extractS3Key(document.url);
                if (oldKey) {
                    try {
                        await this.s3Service.deleteFile(oldKey);
                    } catch (e) {
                        console.warn("Failed to delete old S3 file during update", e);
                    }
                }
            }
            data.url = this.s3Service.getPublicUrl(s3Key);
        }

        return await this.documentRepository.update(id, data);
    }
}
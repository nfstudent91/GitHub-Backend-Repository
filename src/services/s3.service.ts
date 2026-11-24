import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { Readable } from "stream";

dotenv.config();

export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        const region = process.env.AWS_REGION;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        this.bucketName = process.env.AWS_BUCKET_NAME || "";

        if (!region || !accessKeyId || !secretAccessKey || !this.bucketName) {
            console.warn("AWS credentials or bucket name are missing from environment variables.");
        }

        this.s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId: accessKeyId || "",
                secretAccessKey: secretAccessKey || "",
            },
        });
    }

    /**
     * List all files in a specific folder/prefix in S3
     */
    async listFiles(folder: string): Promise<{ key: string; name: string; size: number; lastModified: Date }[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: folder.endsWith('/') ? folder : `${folder}/`,
            });

            const response = await this.s3Client.send(command);
            const files: { key: string; name: string; size: number; lastModified: Date }[] = [];

            if (response.Contents) {
                for (const item of response.Contents) {
                    if (item.Key && item.Key !== folder && item.Key !== `${folder}/`) {
                        // Extract just the filename from the full path
                        const fileName = item.Key.split('/').pop() || item.Key;
                        files.push({
                            key: item.Key,
                            name: fileName,
                            size: item.Size || 0,
                            lastModified: item.LastModified || new Date(),
                        });
                    }
                }
            }

            return files;
        } catch (error) {
            console.error("Error listing files from S3:", error);
            throw new Error("Failed to list files from S3");
        }
    }

    /**
     * Get file content from S3 as Buffer
     */
    async getFile(key: string): Promise<Buffer> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const response = await this.s3Client.send(command);
            
            if (!response.Body) {
                throw new Error("Empty response body");
            }

            // Convert stream to buffer
            const stream = response.Body as Readable;
            const chunks: Buffer[] = [];
            
            for await (const chunk of stream) {
                chunks.push(Buffer.from(chunk));
            }
            
            return Buffer.concat(chunks);
        } catch (error) {
            console.error("Error getting file from S3:", error);
            throw new Error(`Failed to get file from S3: ${key}`);
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileName = `${Date.now()}-${file.originalname}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: "public-read", // Optional: depends on bucket settings
        });

        try {
            await this.s3Client.send(command);
            // Construct the URL (adjust if using a different region or custom domain)
            const region = process.env.AWS_REGION;
            return `https://${this.bucketName}.s3.${region}.amazonaws.com/${fileName}`;
        } catch (error) {
            console.error("Error uploading file to S3:", error);
            throw new Error("Failed to upload file to S3");
        }
    }

    /**
     * Delete a file from S3
     */
    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error) {
            console.error("Error deleting file from S3:", error);
            throw new Error(`Failed to delete file from S3: ${key}`);
        }
    }

    /**
     * Generate a pre-signed PUT URL so the browser can upload directly to S3,
     * bypassing the Amplify/CloudFront 6 MB compute limit entirely.
     */
    async getPresignedUploadUrl(
        fileName: string,
        contentType: string,
        expiresInSeconds = 300
    ): Promise<{ uploadUrl: string; s3Key: string; publicUrl: string }> {
        const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const s3Key = `uploads/${Date.now()}-${sanitized}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, {
            expiresIn: expiresInSeconds,
        });

        const region = process.env.AWS_REGION;
        const publicUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

        return { uploadUrl, s3Key, publicUrl };
    }

    /**
     * Build the public URL for a key that was already uploaded directly by the browser.
     */
    getPublicUrl(s3Key: string): string {
        const region = process.env.AWS_REGION;
        return `https://${this.bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
    }
}
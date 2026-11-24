import { Request, Response } from "express";
import { S3Service } from "../services/s3.service";

const s3Service = new S3Service();

export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const fileUrl = await s3Service.uploadFile(req.file);
        res.status(200).json({
            message: "File uploaded successfully",
            url: fileUrl,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

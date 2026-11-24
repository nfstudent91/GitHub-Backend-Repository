import { Request, Response } from "express";
import { FieldOptionService } from "../services/FieldOptionService";

export class FieldOptionController {
    private fieldOptionService: FieldOptionService;

    constructor() {
        this.fieldOptionService = new FieldOptionService();
    }

    getOptionsByField = async (req: Request, res: Response): Promise<void> => {
        try {
            const fieldId = parseInt(req.params.fieldId);
            if (isNaN(fieldId)) {
                res.status(400).json({ success: false, message: "Invalid field ID" });
                return;
            }

            const options = await this.fieldOptionService.getOptionsByFieldId(fieldId);
            res.status(200).json({
                success: true,
                message: "Field options retrieved successfully",
                data: options,
            });
        } catch (error: any) {
            if (error.message === "Form field not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error retrieving field options",
                    error: error.message,
                });
            }
        }
    };

    createOption = async (req: Request, res: Response): Promise<void> => {
        try {
            const option = await this.fieldOptionService.createOption(req.body);
            res.status(201).json({
                success: true,
                message: "Field option created successfully",
                data: option,
            });
        } catch (error: any) {
            if (error.message === "Form field not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Error creating field option",
                    error: error.message,
                });
            }
        }
    };

    updateOption = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid option ID" });
                return;
            }

            const option = await this.fieldOptionService.updateOption(id, req.body);
            res.status(200).json({
                success: true,
                message: "Field option updated successfully",
                data: option,
            });
        } catch (error: any) {
            if (error.message === "Field option not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Error updating field option",
                    error: error.message,
                });
            }
        }
    };

    deleteOption = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid option ID" });
                return;
            }

            await this.fieldOptionService.deleteOption(id);
            res.status(200).json({
                success: true,
                message: "Field option deleted successfully",
            });
        } catch (error: any) {
            if (error.message === "Field option not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error deleting field option",
                    error: error.message,
                });
            }
        }
    };
}

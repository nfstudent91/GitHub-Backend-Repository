import { Request, Response } from "express";
import { FormFieldService } from "../services/FormFieldService";

export class FormFieldController {
    private formFieldService: FormFieldService;

    constructor() {
        this.formFieldService = new FormFieldService();
    }

    getFieldsByForm = async (req: Request, res: Response): Promise<void> => {
        try {
            const formId = parseInt(req.params.formId);
            if (isNaN(formId)) {
                res.status(400).json({ success: false, message: "Invalid form ID" });
                return;
            }

            const fields = await this.formFieldService.getFieldsByFormId(formId);
            res.status(200).json({
                success: true,
                message: "Form fields retrieved successfully",
                data: fields,
            });
        } catch (error: any) {
            if (error.message === "Form not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error retrieving form fields",
                    error: error.message,
                });
            }
        }
    };

    createField = async (req: Request, res: Response): Promise<void> => {
        try {
            const field = await this.formFieldService.createField(req.body);
            res.status(201).json({
                success: true,
                message: "Form field created successfully",
                data: field,
            });
        } catch (error: any) {
            if (error.message === "Form not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Error creating form field",
                    error: error.message,
                });
            }
        }
    };

    updateField = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid field ID" });
                return;
            }

            const field = await this.formFieldService.updateField(id, req.body);
            res.status(200).json({
                success: true,
                message: "Form field updated successfully",
                data: field,
            });
        } catch (error: any) {
            if (error.message === "Form field not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Error updating form field",
                    error: error.message,
                });
            }
        }
    };

    deleteField = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid field ID" });
                return;
            }

            await this.formFieldService.deleteField(id);
            res.status(200).json({
                success: true,
                message: "Form field deleted successfully",
            });
        } catch (error: any) {
            if (error.message === "Form field not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error deleting form field",
                    error: error.message,
                });
            }
        }
    };
}

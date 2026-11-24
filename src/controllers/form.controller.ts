import { Request, Response } from "express";
import { FormService } from "../services/FormService";

export class FormController {
    private formService: FormService;

    constructor() {
        this.formService = new FormService();
    }

    getAllForms = async (req: Request, res: Response): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;
            const isActive = req.query.isActive !== "false";

            const result = await this.formService.getAllForms(page, limit, search, isActive);

            res.status(200).json({
                success: true,
                message: "Forms retrieved successfully",
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error retrieving forms",
                error: error.message,
            });
        }
    };

    getFormById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid form ID" });
                return;
            }

            const form = await this.formService.getFormById(id);
            res.status(200).json({
                success: true,
                message: "Form retrieved successfully",
                data: form,
            });
        } catch (error: any) {
            if (error.message === "Form not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error retrieving form",
                    error: error.message,
                });
            }
        }
    };

    createForm = async (req: Request, res: Response): Promise<void> => {
        try {
            const form = await this.formService.createForm(req.body);
            res.status(201).json({
                success: true,
                message: "Form created successfully",
                data: form,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: "Error creating form",
                error: error.message,
            });
        }
    };

    updateForm = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid form ID" });
                return;
            }

            const form = await this.formService.updateForm(id, req.body);
            res.status(200).json({
                success: true,
                message: "Form updated successfully",
                data: form,
            });
        } catch (error: any) {
            if (error.message === "Form not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Error updating form",
                    error: error.message,
                });
            }
        }
    };

    deleteForm = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid form ID" });
                return;
            }

            await this.formService.deleteForm(id);
            res.status(200).json({
                success: true,
                message: "Form deleted successfully",
            });
        } catch (error: any) {
            if (error.message === "Form not found") {
                res.status(404).json({ success: false, message: error.message });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error deleting form",
                    error: error.message,
                });
            }
        }
    };
}

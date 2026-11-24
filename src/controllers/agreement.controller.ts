import { Request, Response } from "express";
import { AgreementService } from "../services/agreement.service";

export class AgreementController {
  private agreementService: AgreementService;

  constructor() {
    this.agreementService = new AgreementService();
  }

  /**
   * GET /api/agreement/templates
   * Returns all available agreement templates from S3 AdviserTemplate folder
   */
  listTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const templates = await this.agreementService.listTemplates();

      res.status(200).json({
        success: true,
        message: "Templates retrieved successfully",
        data: templates,
        count: templates.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error retrieving templates",
        error: error.message,
      });
    }
  };

  /**
   * GET /api/agreement/placeholders
   * Returns all placeholder variable names found in the docx template
   */
  getPlaceholders = async (req: Request, res: Response): Promise<void> => {
    try {
      const templateName =
        (req.query.template as string) || "bakeragreement.docx";
      const result =
        await this.agreementService.getTemplatePlaceholders(templateName);

      res.status(200).json({
        success: true,
        message: "Placeholders retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error retrieving placeholders",
          error: error.message,
        });
      }
    }
  };

  /**
   * POST /api/agreement/generate
   * Receives filled-in data and returns a .docx file with placeholders replaced
   */
  generateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { data, templateName } = req.body;

      if (!data || typeof data !== "object") {
        res.status(400).json({
          success: false,
          message: "Data object is required with placeholder values",
        });
        return;
      }

      const template = templateName || "bakeragreement.docx";
      const buffer = await this.agreementService.generateFilledDocument(
        data,
        template
      );

      // Set headers for docx download
      const filename = `agreement_${Date.now()}.docx`;
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", buffer.length);

      res.status(200).send(buffer);
    } catch (error: any) {
      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error generating document",
          error: error.message,
        });
      }
    }
  };
}

import { Router } from "express";
import { FormFieldController } from "../controllers/formfield.controller";

const router = Router();
const formFieldController = new FormFieldController();

router.get("/form/:formId", formFieldController.getFieldsByForm);
router.post("/", formFieldController.createField);
router.put("/:id", formFieldController.updateField);
router.delete("/:id", formFieldController.deleteField);

export default router;

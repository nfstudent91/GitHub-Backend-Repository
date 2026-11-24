import { Router } from "express";
import { FormController } from "../controllers/form.controller";

const router = Router();
const formController = new FormController();

router.get("/", formController.getAllForms);
router.get("/:id", formController.getFormById);
router.post("/", formController.createForm);
router.put("/:id", formController.updateForm);
router.delete("/:id", formController.deleteForm);

export default router;

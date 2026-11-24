import { Router } from "express";
import { FieldOptionController } from "../controllers/field.option.controller";

const router = Router();
const fieldOptionController = new FieldOptionController();

router.get("/field/:fieldId", fieldOptionController.getOptionsByField);
router.post("/", fieldOptionController.createOption);
router.put("/:id", fieldOptionController.updateOption);
router.delete("/:id", fieldOptionController.deleteOption);

export default router;

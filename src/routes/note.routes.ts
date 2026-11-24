import { Router } from "express";
import { NoteController } from "../controllers/note.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const noteController = new NoteController();

// All routes require authentication
router.use(authMiddleware);

// GET /api/notes - Get all notes
router.get("/", noteController.getAllNotes);

// GET /api/notes/count - Get note count (must be before /:id)
router.get("/count", noteController.getNoteCount);

// GET /api/notes/lead/:leadId - Get notes by lead ID
router.get("/lead/:leadId", noteController.getNotesByLeadId);

// GET /api/notes/:id - Get note by ID
router.get("/:id", noteController.getNoteById);

// POST /api/notes - Create new note
router.post("/", noteController.createNote);

// PUT /api/notes/:id - Update note
router.put("/:id", noteController.updateNote);

// DELETE /api/notes/:id - Delete note
router.delete("/:id", noteController.deleteNote);

export default router;

import { Request, Response } from "express";
import { NoteService } from "../services/note.service";

export class NoteController {
    private noteService: NoteService;

    constructor() {
        this.noteService = new NoteService();
    }

    // GET /api/notes - Get all notes
    getAllNotes = async (req: Request, res: Response): Promise<void> => {
        try {
            const notes = await this.noteService.getAllNotes();
            res.status(200).json({
                success: true,
                message: "Notes retrieved successfully",
                data: notes,
                count: notes.length,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error retrieving notes",
                error: error.message,
            });
        }
    };

    // GET /api/notes/:id - Get note by ID
    getNoteById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid note ID",
                });
                return;
            }

            const note = await this.noteService.getNoteById(id);
            res.status(200).json({
                success: true,
                message: "Note retrieved successfully",
                data: note,
            });
        } catch (error: any) {
            if (error.message === "Note not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error retrieving note",
                    error: error.message,
                });
            }
        }
    };

    // GET /api/notes/lead/:leadId - Get notes by lead ID
    getNotesByLeadId = async (req: Request, res: Response): Promise<void> => {
        try {
            const leadId = parseInt(req.params.leadId);

            if (isNaN(leadId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid lead ID",
                });
                return;
            }

            const notes = await this.noteService.getNotesByLeadId(leadId);
            res.status(200).json({
                success: true,
                message: "Notes retrieved successfully",
                data: notes,
                count: notes.length,
            });
        } catch (error: any) {
            if (error.message === "Lead not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error retrieving notes",
                    error: error.message,
                });
            }
        }
    };

    // POST /api/notes - Create new note
    createNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const noteData = req.body;

            // Add createdBy from authenticated user if available
            if (req.user && !noteData.createdBy) {
                noteData.createdBy = req.user.username || req.user.fullname;
            }

            const note = await this.noteService.createNote(noteData);
            res.status(201).json({
                success: true,
                message: "Note created successfully",
                data: note,
            });
        } catch (error: any) {
            if (
                error.message.includes("required") ||
                error.message.includes("not found")
            ) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error creating note",
                    error: error.message,
                });
            }
        }
    };

    // PUT /api/notes/:id - Update note
    updateNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid note ID",
                });
                return;
            }

            const noteData = req.body;
            const note = await this.noteService.updateNote(id, noteData);
            res.status(200).json({
                success: true,
                message: "Note updated successfully",
                data: note,
            });
        } catch (error: any) {
            if (error.message === "Note not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else if (error.message.includes("cannot") || error.message.includes("Cannot")) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error updating note",
                    error: error.message,
                });
            }
        }
    };

    // DELETE /api/notes/:id - Delete note
    deleteNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid note ID",
                });
                return;
            }

            await this.noteService.deleteNote(id);
            res.status(200).json({
                success: true,
                message: "Note deleted successfully",
            });
        } catch (error: any) {
            if (error.message === "Note not found") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error deleting note",
                    error: error.message,
                });
            }
        }
    };

    // GET /api/notes/count - Get note count
    getNoteCount = async (req: Request, res: Response): Promise<void> => {
        try {
            const count = await this.noteService.getNoteCount();
            res.status(200).json({
                success: true,
                message: "Note count retrieved successfully",
                count: count,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error retrieving note count",
                error: error.message,
            });
        }
    };
}

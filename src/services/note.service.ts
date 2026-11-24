import { NoteRepository } from "../repositories/note.repository";
import { Note } from "../entities/Note";
import { LeadRepository } from "../repositories/lead.repository";

export class NoteService {
    private noteRepository: NoteRepository;
    private leadRepository: LeadRepository;

    constructor() {
        this.noteRepository = new NoteRepository();
        this.leadRepository = new LeadRepository();
    }

    async getAllNotes(): Promise<Note[]> {
        return await this.noteRepository.findAll();
    }

    async getNoteById(id: number): Promise<Note | null> {
        const note = await this.noteRepository.findById(id);
        if (!note) {
            throw new Error("Note not found");
        }
        return note;
    }

    async getNotesByLeadId(leadId: number): Promise<Note[]> {
        // Verify lead exists
        const lead = await this.leadRepository.findById(leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }
        return await this.noteRepository.findByLeadId(leadId);
    }

    async createNote(noteData: Partial<Note>): Promise<Note> {
        // Validate required fields
        if (!noteData.leadId) {
            throw new Error("Lead ID is required");
        }
        if (!noteData.text || noteData.text.trim() === "") {
            throw new Error("Note text is required");
        }

        // Verify lead exists
        const lead = await this.leadRepository.findById(noteData.leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        return await this.noteRepository.create(noteData);
    }

    async updateNote(id: number, noteData: Partial<Note>): Promise<Note | null> {
        // Check if note exists
        const existingNote = await this.noteRepository.findById(id);
        if (!existingNote) {
            throw new Error("Note not found");
        }

        // Validate text if provided
        if (noteData.text !== undefined && noteData.text.trim() === "") {
            throw new Error("Note text cannot be empty");
        }

        // Don't allow changing leadId
        if (noteData.leadId && noteData.leadId !== existingNote.leadId) {
            throw new Error("Cannot change lead ID of a note");
        }

        return await this.noteRepository.update(id, noteData);
    }

    async deleteNote(id: number): Promise<boolean> {
        // Check if note exists
        const existingNote = await this.noteRepository.findById(id);
        if (!existingNote) {
            throw new Error("Note not found");
        }

        return await this.noteRepository.delete(id);
    }

    async getNoteCount(): Promise<number> {
        return await this.noteRepository.count();
    }

    async getNoteCountByLeadId(leadId: number): Promise<number> {
        return await this.noteRepository.countByLeadId(leadId);
    }
}

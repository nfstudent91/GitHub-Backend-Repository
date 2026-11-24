import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Note } from "../entities/Note";

export class NoteRepository {
    private repository: Repository<Note>;

    constructor() {
        this.repository = AppDataSource.getRepository(Note);
    }

    async findAll(): Promise<Note[]> {
        return await this.repository.find({
            relations: ["lead"],
            order: { createdAt: "DESC" },
        });
    }

    async findById(id: number): Promise<Note | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ["lead"],
        });
    }

    async findByLeadId(leadId: number): Promise<Note[]> {
        return await this.repository.find({
            where: { leadId },
            order: { createdAt: "DESC" },
        });
    }

    async create(noteData: Partial<Note>): Promise<Note> {
        const note = this.repository.create(noteData);
        return await this.repository.save(note);
    }

    async update(id: number, noteData: Partial<Note>): Promise<Note | null> {
        await this.repository.update(id, noteData);
        return await this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async count(): Promise<number> {
        return await this.repository.count();
    }

    async countByLeadId(leadId: number): Promise<number> {
        return await this.repository.count({ where: { leadId } });
    }
}

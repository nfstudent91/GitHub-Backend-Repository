import { Repository, Between, Raw, Brackets } from "typeorm";
import { AppDataSource } from "../config/database";
import { DocumentUpload, DocumentStatus } from "../entities/DocumentUpload";

export class DocumentRepository {
    private repository: Repository<DocumentUpload>;

    constructor() {
        this.repository = AppDataSource.getRepository(DocumentUpload);
    }

    async create(data: Partial<DocumentUpload>): Promise<DocumentUpload> {
        const document = this.repository.create(data);
        return await this.repository.save(document);
    }

    async findById(id: number): Promise<DocumentUpload | null> {
        return await this.repository.findOne({ where: { id } });
    }

    async findAllByLeadId(leadId: number): Promise<DocumentUpload[]> {
        return await this.repository.find({
            where: { leadId },
            order: { createdAt: "DESC" },
        });
    }

    async findExpiringWithinWeek(searchText?: string): Promise<DocumentUpload[]> {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const todayStr = today.toISOString().split('T')[0];
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        const query = this.repository.createQueryBuilder("doc")
            .leftJoinAndSelect("doc.lead", "lead")
            .where("doc.expiryDate >= :today", { today: todayStr })
            .andWhere("doc.expiryDate <= :nextWeek", { nextWeek: nextWeekStr })
            .orderBy("doc.expiryDate", "ASC");

        if (searchText) {
            query.andWhere(new Brackets(qb => {
                qb.where("lead.fullname LIKE :searchText", { searchText: `%${searchText}%` })
                    .orWhere("doc.documentLabel LIKE :searchText", { searchText: `%${searchText}%` });
            }));
        }

        return await query.getMany();
    }

    async update(id: number, data: Partial<DocumentUpload>): Promise<DocumentUpload | null> {
        await this.repository.update(id, data);
        return await this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
    async getDashboardStats(userId: number): Promise<any> {
        // 1. Uploaded Documents (Count of all documents for leads assigned to this user)
        const uploadedDocuments = await this.repository.createQueryBuilder("doc")
            .leftJoin("doc.lead", "lead")
            .leftJoin("lead.assignments", "assignments")
            .where("assignments.assignedTo = :userId", { userId })
            // .andWhere("lead.isActive = :isActive", { isActive: true }) // Optional: Ensure lead is active
            .getCount();

        // 2. Pending Leads (Count of distinct leads with at least one PENDING document)
        const pendingLeadsCount = await this.repository.createQueryBuilder("doc")
            .leftJoin("doc.lead", "lead")
            .leftJoin("lead.assignments", "assignments")
            .select("COUNT(DISTINCT doc.leadId)", "count")
            .where("assignments.assignedTo = :userId", { userId })
            .andWhere("doc.status = :status", { status: DocumentStatus.PENDING })
            .getRawOne();

        // 3. Expired Leads (Count of distinct leads with at least one expired document relative to today)
        const todayStr = new Date().toISOString().split('T')[0];
        const expiredLeadsCount = await this.repository.createQueryBuilder("doc")
            .leftJoin("doc.lead", "lead")
            .leftJoin("lead.assignments", "assignments")
            .select("COUNT(DISTINCT doc.leadId)", "count")
            .where("assignments.assignedTo = :userId", { userId })
            .andWhere("doc.expiryDate <= :today", { today: todayStr })
            .getRawOne();

        return {
            uploadedDocuments,
            pendingLeads: parseInt(pendingLeadsCount.count || "0"),
            expiredLeads: parseInt(expiredLeadsCount.count || "0")
        };
    }

    async findExpiringDocuments(userId: number, days: number = 7): Promise<DocumentUpload[]> {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        const todayStr = today.toISOString().split('T')[0];
        const futureDateStr = futureDate.toISOString().split('T')[0];

        return await this.repository.createQueryBuilder("doc")
            .leftJoinAndSelect("doc.lead", "lead")
            .leftJoin("lead.assignments", "assignments")
            .where("assignments.assignedTo = :userId", { userId })
            .andWhere("doc.expiryDate >= :today", { today: todayStr })
            // .andWhere("doc.expiryDate <= :futureDate", { futureDate: futureDateStr })
            .orderBy("doc.expiryDate", "ASC")
            .take(5) // Limit to 5 alerts as per requirement example logic (or remove limit if all needed)
            .getMany();
    }

    async search(searchText: string): Promise<DocumentUpload[]> {
        const query = this.repository.createQueryBuilder("doc")
            .leftJoinAndSelect("doc.lead", "lead")
            .orderBy("doc.createdAt", "DESC");

        if (searchText) {
            query.where(new Brackets(qb => {
                qb.where("lead.fullname LIKE :searchText", { searchText: `%${searchText}%` })
                    .orWhere("doc.documentLabel LIKE :searchText", { searchText: `%${searchText}%` });
            }));
        }

        return await query.getMany();
    }

    // Auto-expire documents whose expiryDate is past today
    async markExpiredDocuments(): Promise<void> {
        const todayStr = new Date().toISOString().split('T')[0];
        await this.repository.createQueryBuilder()
            .update(DocumentUpload)
            .set({ status: DocumentStatus.EXPIRED })
            .where("expiryDate < :today AND status != :expired", { today: todayStr, expired: DocumentStatus.EXPIRED })
            .execute();

    }
}

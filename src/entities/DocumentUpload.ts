import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Lead } from "./Lead";

export enum DocumentStatus {
    PENDING = "Pending",
    VERIFIED = "Verified",
    REJECTED = "Rejected",
    MISSING = "Missing",
    IN_PROGRESS = "In Progress",
    EXPIRED = "Expired"
}

@Entity("document_uploads")
export class DocumentUpload {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        nullable: true,
        default: DocumentStatus.PENDING
    })
    status: DocumentStatus;

    @Column({ type: "varchar", length: 255, nullable: true })
    documentLabel: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    expiryDate: string;

    @Column({ type: "varchar", length: 500, nullable: true })
    url: string;

    @Column({ type: "int", nullable: true })
    leadId: number;

    @ManyToOne(() => Lead, (lead) => lead.documents)
    @JoinColumn({ name: "leadId" })
    lead: Lead;

    @Column({ type: "varchar", length: 100, nullable: true })
    uploadedBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

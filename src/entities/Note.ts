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

@Entity("notes")
export class Note {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "lead_id" })
    leadId: number;

    @ManyToOne(() => Lead, (lead) => lead.notes)
    @JoinColumn({ name: "lead_id" })
    lead: Lead;

    @Column({ type: "text" })
    text: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

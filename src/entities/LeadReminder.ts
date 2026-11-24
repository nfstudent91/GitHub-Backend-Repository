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
import { User } from "./User";

export enum ReminderStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    DISMISSED = "dismissed",
}

export enum ReminderType {
    EMAIL = "email",
    NOTIFICATION = "notification",
    SMS = "sms",
}

@Entity("lead_reminder")
export class LeadReminder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "lead_id" })
    leadId: number;

    @ManyToOne(() => Lead, (lead) => lead.reminders)
    @JoinColumn({ name: "lead_id" })
    lead: Lead;

    @Column({ name: "user_id" })
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ type: "varchar", length: 200 })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ name: "reminder_date_time", type: "datetime" })
    reminderDateTime: Date;

    @Column({
        type: "enum",
        enum: ReminderStatus,
        default: ReminderStatus.PENDING,
    })
    status: ReminderStatus;

    @Column({
        type: "enum",
        enum: ReminderType,
        default: ReminderType.NOTIFICATION,
    })
    type: ReminderType;

    @Column({ type: "varchar", length: 100, nullable: true })
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

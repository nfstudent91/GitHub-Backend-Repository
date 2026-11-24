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
import { FollowUp } from "./FollowUp";

@Entity("lead_attempt")
export class LeadAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "lead_id" })
  leadId: number;

  @ManyToOne(() => Lead, (lead) => lead.attempts)
  @JoinColumn({ name: "lead_id" })
  lead: Lead;

  @Column({ name: "follow_type_id" })
  followTypeId: number;

  @ManyToOne(() => FollowUp, (followUp) => followUp.leadAttempts)
  @JoinColumn({ name: "follow_type_id" })
  followType: FollowUp;

  @Column({ type: "varchar", length: 100, nullable: true })
  remarks: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  outcome: string;

  @Column({ type: "datetime", nullable: true })
  callTime: Date;

  @Column({ type: "int", nullable: true })
  duration: number;

  @Column({ type: "datetime", nullable: true })
  scheduledTime: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


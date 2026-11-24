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

@Entity("lead_history")
export class LeadHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "lead_id" })
  leadId: number;

  @ManyToOne(() => Lead, (lead) => lead.histories)
  @JoinColumn({ name: "lead_id" })
  lead: Lead;

  @Column({ name: "assigned_to" })
  assignedTo: number;

  @ManyToOne(() => User, (user) => user.leadHistories)
  @JoinColumn({ name: "assigned_to" })
  assignedToUser: User;

  @Column({ name: "assigned_by" })
  assignedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_by" })
  assignedByUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


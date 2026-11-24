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

@Entity("lead_assignments")
export class LeadAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "lead_id" })
  leadId: number;

  @ManyToOne(() => Lead, (lead) => lead.assignments)
  @JoinColumn({ name: "lead_id" })
  lead: Lead;

  @Column({ name: "assigned_to" })
  assignedTo: number;

  @ManyToOne(() => User, (user) => user.leadAssignments)
  @JoinColumn({ name: "assigned_to" })
  assignedToUser: User;

  @Column({ name: "assigned_by" })
  assignedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_by" })
  assignedByUser: User;

  @Column({ type: "text", nullable: true })
  remarks: string;

  @Column({ name: "can_access_previous_logs", type: "boolean", default: true })
  canAccessPreviousLogs: boolean;

  @Column({ type: "varchar", length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


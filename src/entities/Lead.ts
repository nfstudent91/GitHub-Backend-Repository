import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Stage } from "./Stage";
import { LeadAssignment } from "./LeadAssignment";
import { LeadHistory } from "./LeadHistory";
import { LeadAttempt } from "./LeadAttempt";
import { LeadReminder } from "./LeadReminder";
import { DocumentUpload } from "./DocumentUpload";
import { Note } from "./Note";
import { MetaForm } from "./MetaForm";

export enum LeadStatus {
  NEW = "New",
  NOT_ANSWERED = "Not Answered",
  BUSY = "Busy",
  ANSWERED = "Answered",
  FOLLOW_UP = "Follow Up",
  MEETING_SCHEDULED = "Meeting Scheduled",
  MEETING_DONE = "Meeting Done",
  AGREEMENT_PENDING = "Agreement Pending",
  AGREEMENT_DONE = "Agreement Done",
  PAYMENT_PENDING = "Payment Pending",
  PAYMENT_DONE = "Payment Done",
  COMPLETED = "Completed",
  DOCUMENTATION = "Documentation",
  NOT_INTERESTED = "Not Interested",
  NOT_ELIGIBLE = "Not Eligible",
  NO_SHOW = "No Show",
  WRONG_NUMBER = "Wrong Number",
  APPOINTMENT_BOOKED = "Appointment Booked",
  VISA_GRANTED = "Visa Granted",
  NIF_DONE = "NIF Done",
  INCORPORATION_DONE = "Incorporation Done",
  DECISION_PENDING = "Decision Pending",
  ENDORSEMENT_GRANTED = "Endorsement Granted",
  VISA_REJECTED = "Visa Rejected",
  REFUNDED = "Refunded",
}

@Entity("leads")
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  fullname: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  email: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  phone: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  whatsapp: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  leadDate: string;

  // @Column({ type: "varchar", length: 100, nullable: true })
  // leadOwner: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  leadSource: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  leadSubsource: string;

  @ManyToOne(() => MetaForm, { createForeignKeyConstraints: false })
  @JoinColumn({ name: "leadSubsource", referencedColumnName: "formId" })
  metaForm: MetaForm;

  @Column({ type: "int", nullable: true })
  monthlyIncome: number;

  @Column({ type: "varchar", length: 200, nullable: true })
  jobTitle: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  visaCategory: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  country: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  targetCountry: string;

  @Column({ type: "json", nullable: true })
  formData: any;

  // @Column({ type: "json", nullable: true })
  // notesData: Record<string, any>[];

  @Column({ name: "stageId", default: 9, nullable: true })
  stageId: number;

  @ManyToOne(() => Stage, (stage) => stage.leads)
  @JoinColumn({ name: "stageId" })
  stage: Stage;

  @Column({
    type: "varchar",
    // enum: LeadStatus,
    nullable: true,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({ type: "varchar", length: 100, nullable: true })
  selectedDocumentCheckList: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "varchar", length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LeadAssignment, (assignment) => assignment.lead)
  assignments: LeadAssignment[];

  @OneToMany(() => LeadHistory, (history) => history.lead)
  histories: LeadHistory[];

  @OneToMany(() => LeadAttempt, (attempt) => attempt.lead)
  attempts: LeadAttempt[];

  @OneToMany(() => LeadReminder, (reminder) => reminder.lead)
  reminders: LeadReminder[];

  @OneToMany(() => DocumentUpload, (document) => document.lead)
  documents: DocumentUpload[];

  @OneToMany(() => Note, (note) => note.lead)
  notes: Note[];
}

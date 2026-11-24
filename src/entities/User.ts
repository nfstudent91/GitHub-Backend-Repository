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
import { Role } from "./Role";
import { LeadAssignment } from "./LeadAssignment";
import { LeadHistory } from "./LeadHistory";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  fullname: string;

  @Column({ type: "boolean", default: false })
  isPasswordChanged: boolean;

  @Column({ type: "varchar", length: 100, unique: true })
  username: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "varchar", length: 100 })
  email: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  phone: string;

  @Column({ name: "roleId" })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "roleId" })
  role: Role;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "varchar", length: 100, nullable: true })
  createdBy: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  resetPasswordToken: string;

  @Column({ type: "datetime", nullable: true })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LeadAssignment, (assignment) => assignment.assignedToUser)
  leadAssignments: LeadAssignment[];

  @OneToMany(() => LeadHistory, (history) => history.assignedToUser)
  leadHistories: LeadHistory[];
}


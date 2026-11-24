import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { FormField } from "./FormField";

@Entity("forms")
export class Form {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => FormField, (field) => field.form, { cascade: true })
  fields: FormField[];

  // @OneToMany(() => FormSubmission, (submission) => submission.form)
  // submissions: FormSubmission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

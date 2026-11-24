import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Form } from "./Form";
import { FieldOption } from "./FieldOption";

@Entity("form_fields")
export class FormField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  formId: number;

  @Column({ type: "varchar", length: 100 })
  fieldName: string;

  @Column({ type: "varchar", length: 255 })
  fieldLabel: string;

  @Column({ type: "varchar", length: 50 })
  fieldType: string;

  @Column({ type: "boolean", default: false })
  isRequired: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  placeholder: string;

  @Column({ type: "text", nullable: true })
  defaultValue: string;

  @Column({ type: "json", nullable: true })
  validationRules: Record<string, any>;

  @Column({ type: "int", default: 0 })
  orderIndex: number;

  @ManyToOne(() => Form, (form) => form.fields, { onDelete: "CASCADE" })
  @JoinColumn({ name: "formId" })
  form: Form;

  @OneToMany(() => FieldOption, (option) => option.field, { cascade: true })
  options: FieldOption[];

  // @OneToMany(() => SubmissionData, (data) => data.field)
  // submissionData: SubmissionData[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { FormField } from "./FormField";

@Entity("field_options")
export class FieldOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  fieldId: number;

  @Column({ type: "varchar", length: 255 })
  label: string;

  @Column({ type: "varchar", length: 255 })
  value: string;

  @Column({ type: "int", default: 0 })
  orderIndex: number;

  @ManyToOne(() => FormField, (field) => field.options, { onDelete: "CASCADE" })
  @JoinColumn({ name: "fieldId" })
  field: FormField;
}

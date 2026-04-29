import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity("rsvps")
export class Rsvp {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  guest_name: string;

  @Column()
  side: string;

  @Column()
  attending: boolean;

  @Column({ type: "int", default: 1 })
  guest_count: number;

  @Column({ type: "uuid", array: true, default: () => "'{}'::uuid[]" })
  event_ids: string[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
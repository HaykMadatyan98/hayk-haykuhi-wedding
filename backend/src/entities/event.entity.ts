import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "timestamptz" })
  event_time: Date;

  @Column()
  address: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ type: "varchar", length: 1000, nullable: true })
  map_url: string | null;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "int", default: 0 })
  display_order: number;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
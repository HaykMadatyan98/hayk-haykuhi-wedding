import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("wedding_settings")
export class WeddingSettings {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: "Անի" })
  bride_name: string;

  @Column({ default: "Արամ" })
  groom_name: string;

  @Column({ type: "timestamptz", default: () => "now() + interval '90 days'" })
  wedding_date: Date;

  @Column({ type: "text", nullable: true })
  cover_image_url: string | null;

  @Column({ type: "text", nullable: true })
  couple_photo_url: string | null;

  @Column({ type: "text", default: "Սիրով հրավիրում ենք Ձեզ մեր հարսանիքին" })
  invitation_text: string;

  @Column({ type: "text", nullable: true })
  invitation_image_1: string | null;

  @Column({ type: "text", nullable: true })
  invitation_image_2: string | null;

  @Column({ type: "jsonb", default: () => "'[]'::jsonb" })
  gallery_images: string[];

  @Column({ type: "text", default: "Շնորհակալություն" })
  thank_you_text: string;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
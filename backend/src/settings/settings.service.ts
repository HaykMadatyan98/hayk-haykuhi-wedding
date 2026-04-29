import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WeddingSettings } from "../entities/wedding-settings.entity";

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(WeddingSettings) private repo: Repository<WeddingSettings>) {}

  async getOrCreate(): Promise<WeddingSettings> {
    let s = await this.repo.findOne({ where: {}, order: { updated_at: "DESC" } });
    if (!s) s = await this.repo.save(this.repo.create({}));
    return s;
  }

  async update(id: string, patch: Partial<WeddingSettings>) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException();
    Object.assign(existing, patch);
    return this.repo.save(existing);
  }
}
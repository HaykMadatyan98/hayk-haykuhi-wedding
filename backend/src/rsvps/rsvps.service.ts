import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rsvp } from "../entities/rsvp.entity";

@Injectable()
export class RsvpsService {
  constructor(@InjectRepository(Rsvp) private repo: Repository<Rsvp>) {}

  list() {
    return this.repo.find({ order: { created_at: "DESC" } });
  }

  create(data: Partial<Rsvp>) {
    return this.repo.save(this.repo.create(data));
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { ok: true };
  }
}
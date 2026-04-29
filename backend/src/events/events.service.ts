import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "../entities/event.entity";

@Injectable()
export class EventsService {
  constructor(@InjectRepository(Event) private repo: Repository<Event>) {}

  list() {
    return this.repo.find({ order: { display_order: "ASC" } });
  }

  create(data: Partial<Event>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Event>) {
    const ev = await this.repo.findOne({ where: { id } });
    if (!ev) throw new NotFoundException();
    Object.assign(ev, data);
    return this.repo.save(ev);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { ok: true };
  }
}
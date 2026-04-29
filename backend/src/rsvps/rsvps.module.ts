import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Rsvp } from "../entities/rsvp.entity";
import { RsvpsController } from "./rsvps.controller";
import { RsvpsService } from "./rsvps.service";

@Module({
  imports: [TypeOrmModule.forFeature([Rsvp])],
  controllers: [RsvpsController],
  providers: [RsvpsService],
})
export class RsvpsModule {}
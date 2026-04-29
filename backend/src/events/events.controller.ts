import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { EventsService } from "./events.service";

class EventDto {
  @IsString() @MaxLength(200) title: string;
  @IsDateString() event_time: string;
  @IsString() @MaxLength(500) address: string;
  @IsOptional() @IsNumber() latitude?: number | null;
  @IsOptional() @IsNumber() longitude?: number | null;
  @IsOptional() @IsUrl() @MaxLength(1000) map_url?: string | null;
  @IsOptional() @IsString() @MaxLength(2000) description?: string | null;
  @IsOptional() @IsInt() @Min(0) display_order?: number;
}

@Controller("events")
export class EventsController {
  constructor(private svc: EventsService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() body: EventDto) {
    return this.svc.create(body as any);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() body: EventDto) {
    return this.svc.update(id, body as any);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.svc.remove(id);
  }
}
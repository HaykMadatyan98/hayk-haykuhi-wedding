import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { RsvpsService } from "./rsvps.service";

class CreateRsvpDto {
  @IsString() @MaxLength(100) guest_name: string;
  @IsIn(["bride", "groom"]) side: "bride" | "groom";
  @IsBoolean() attending: boolean;
  @IsInt() @Min(1) @Max(20) guest_count: number;
  @IsArray() @ArrayMaxSize(20) @IsUUID("4", { each: true }) event_ids: string[];
}

@Controller("rsvps")
export class RsvpsController {
  constructor(private svc: RsvpsService) {}

  @Post()
  create(@Body() body: CreateRsvpDto) {
    return this.svc.create(body as any);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  list() {
    return this.svc.list();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.svc.remove(id);
  }
}
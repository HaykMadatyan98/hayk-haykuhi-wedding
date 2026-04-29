import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { IsArray, IsDateString, IsOptional, IsString, MaxLength } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { SettingsService } from "./settings.service";

class UpdateSettingsDto {
  @IsOptional() @IsString() @MaxLength(100) bride_name?: string;
  @IsOptional() @IsString() @MaxLength(100) groom_name?: string;
  @IsOptional() @IsDateString() wedding_date?: string;
  @IsOptional() @IsString() cover_image_url?: string | null;
  @IsOptional() @IsString() couple_photo_url?: string | null;
  @IsOptional() @IsString() @MaxLength(2000) invitation_text?: string;
  @IsOptional() @IsString() invitation_image_1?: string | null;
  @IsOptional() @IsString() invitation_image_2?: string | null;
  @IsOptional() @IsArray() gallery_images?: string[];
  @IsOptional() @IsString() @MaxLength(200) thank_you_text?: string;
}

@Controller("settings")
export class SettingsController {
  constructor(private svc: SettingsService) {}

  @Get()
  get() {
    return this.svc.getOrCreate();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() body: UpdateSettingsDto) {
    return this.svc.update(id, body as any);
  }
}
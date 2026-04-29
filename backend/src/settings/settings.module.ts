import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeddingSettings } from "../entities/wedding-settings.entity";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@Module({
  imports: [TypeOrmModule.forFeature([WeddingSettings])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
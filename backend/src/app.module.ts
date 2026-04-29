import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeddingSettings } from "./entities/wedding-settings.entity";
import { Event } from "./entities/event.entity";
import { Rsvp } from "./entities/rsvp.entity";
import { User } from "./entities/user.entity";
import { AuthModule } from "./auth/auth.module";
import { SettingsModule } from "./settings/settings.module";
import { EventsModule } from "./events/events.module";
import { RsvpsModule } from "./rsvps/rsvps.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || "wedding",
      password: process.env.DB_PASSWORD || "wedding",
      database: process.env.DB_NAME || "wedding",
      entities: [WeddingSettings, Event, Rsvp, User],
      synchronize: true,
    }),
    AuthModule,
    SettingsModule,
    EventsModule,
    RsvpsModule,
  ],
})
export class AppModule {}
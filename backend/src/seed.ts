import "reflect-metadata";
import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";
import { config } from "dotenv";
import { User } from "./entities/user.entity";
import { WeddingSettings } from "./entities/wedding-settings.entity";
import { Event } from "./entities/event.entity";
import { Rsvp } from "./entities/rsvp.entity";

config();

async function run() {
  const ds = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || "wedding",
    password: process.env.DB_PASSWORD || "wedding",
    database: process.env.DB_NAME || "wedding",
    entities: [User, WeddingSettings, Event, Rsvp],
    synchronize: true,
  });
  await ds.initialize();

  const userRepo = ds.getRepository(User);
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "changeme123";

  let admin = await userRepo.findOne({ where: { email } });
  if (!admin) {
    admin = await userRepo.save(
      userRepo.create({
        email,
        password_hash: await bcrypt.hash(password, 10),
        role: "admin",
      }),
    );
    console.log(`Admin created: ${email} / ${password}`);
  } else {
    admin.role = "admin";
    await userRepo.save(admin);
    console.log(`Admin role ensured for ${email}`);
  }

  const settingsRepo = ds.getRepository(WeddingSettings);
  const count = await settingsRepo.count();
  if (count === 0) {
    await settingsRepo.save(settingsRepo.create({}));
    console.log("Default wedding_settings row created");
  }

  await ds.destroy();
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
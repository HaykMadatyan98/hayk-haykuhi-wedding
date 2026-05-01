import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import axios from "axios";
/**
 * Normalize an origin for CORS comparisons.
 * - Trims whitespace
 * - Removes trailing slashes
 */
function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  app.enableCors({
    origin(origin, callback) {
      // Non-browser clients (curl/postman) may send no Origin header.
      if (!origin) return callback(null, true);

      // Some contexts (e.g. sandboxed iframes, file://) can send "null".
      if (origin === "null") return callback(null, false);

      const normalized = normalizeOrigin(origin);
      const isAllowed = allowedOrigins.includes(normalized);
      return callback(null, isAllowed);
    },
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix("api");
  const port = Number(process.env.PORT || 3001);
  await app.listen(port);
  console.log(`Wedding API listening on http://localhost:${port}`);
  const RENDER_EXTERNAL_URL = `https://wedding-backend.onrender.com/api/health`;

  setInterval(async () => {
    try {
      // Делаем запрос на собственный внешний URL
      await axios.get(RENDER_EXTERNAL_URL);
      console.log(`[Self-Ping] Success: ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`[Self-Ping] Error: ${error.message}`);
    }
  }, 45000);
}
bootstrap();

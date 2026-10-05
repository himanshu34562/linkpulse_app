import cors from "@fastify/cors";
import Fastify from "fastify";
import { config } from "./config.js";
import { pool } from "./db.js";
import { linkRoutes } from "./routes/links.js";
import { redirectRoutes } from "./routes/redirect.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get("/healthz", async () => {
  await pool.query("SELECT 1");
  return { status: "ok" };
});

// Register /api routes before the catch-all /:code redirect.
await app.register(linkRoutes);
await app.register(redirectRoutes);

const shutdown = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await app.listen({ port: config.port, host: "0.0.0.0" });

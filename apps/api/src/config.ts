export const config = {
  port: Number(process.env.PORT ?? 3000),
  baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgres://linkpulse:linkpulse@localhost:5432/linkpulse",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
};

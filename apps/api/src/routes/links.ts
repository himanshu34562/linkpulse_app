import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { codeFromId } from "../base62.js";
import { config } from "../config.js";
import { pool, type LinkRow } from "../db.js";

const createSchema = z.object({
  url: z
    .string()
    .url()
    .max(2048)
    .refine((u) => /^https?:\/\//i.test(u), "only http(s) URLs are allowed"),
});

function serialize(row: LinkRow) {
  return {
    id: row.id,
    code: row.code,
    shortUrl: `${config.baseUrl}/${row.code}`,
    originalUrl: row.original_url,
    clicks: Number(row.clicks),
    createdAt: row.created_at,
  };
}

export async function linkRoutes(app: FastifyInstance) {
  app.post("/api/links", async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "invalid_request", details: parsed.error.flatten() });
    }

    // Two-step insert: the sequence gives us a unique id, and the code is a
    // deterministic base62 encoding of it. No collision handling is needed.
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const ins = await client.query<{ id: string }>(
        "INSERT INTO links (original_url) VALUES ($1) RETURNING id",
        [parsed.data.url],
      );
      const code = codeFromId(BigInt(ins.rows[0]!.id));
      const upd = await client.query<LinkRow>(
        "UPDATE links SET code = $1 WHERE id = $2 RETURNING *",
        [code, ins.rows[0]!.id],
      );
      await client.query("COMMIT");
      return reply.code(201).send(serialize(upd.rows[0]!));
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  });

  app.get("/api/links", async () => {
    const { rows } = await pool.query<LinkRow>(
      "SELECT * FROM links ORDER BY id DESC LIMIT 100",
    );
    return rows.map(serialize);
  });
}

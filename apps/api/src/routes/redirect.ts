import type { FastifyInstance } from "fastify";
import { pool } from "../db.js";

export async function redirectRoutes(app: FastifyInstance) {
  app.get<{ Params: { code: string } }>("/:code", async (req, reply) => {
    const { code } = req.params;
    if (!/^[0-9A-Za-z]{1,32}$/.test(code)) {
      return reply.code(404).send({ error: "not_found" });
    }

    // Stage 1: one UPDATE both counts the click and returns the target.
    // This puts a write on the hot read path. Stages 3 and 4 remove it
    // (cache the lookup, move click counting to a queue).
    const { rows } = await pool.query<{ original_url: string }>(
      "UPDATE links SET clicks = clicks + 1 WHERE code = $1 RETURNING original_url",
      [code],
    );
    if (rows.length === 0) {
      return reply.code(404).send({ error: "not_found" });
    }
    return reply.redirect(rows[0]!.original_url, 302);
  });
}

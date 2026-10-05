import pg from "pg";
import { config } from "./config.js";

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 20,
});

export interface LinkRow {
  id: string;
  code: string;
  original_url: string;
  clicks: string;
  created_at: Date;
}

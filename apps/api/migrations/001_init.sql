CREATE TABLE IF NOT EXISTS links (
  id           BIGSERIAL PRIMARY KEY,
  code         TEXT UNIQUE,
  original_url TEXT NOT NULL,
  clicks       BIGINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The redirect hot path looks links up by code.
CREATE UNIQUE INDEX IF NOT EXISTS links_code_idx ON links (code);

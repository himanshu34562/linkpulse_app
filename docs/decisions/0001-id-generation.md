# ADR 0001: How short codes are generated

## Status
Accepted for stage 1. Revisit in stage 2.

## Context
Each link needs a short, unique code. The main options:

1. **Hash the URL** (MD5/SHA, take the first N characters). Needs collision
   handling, and the same URL always maps to the same code, which may or may
   not be desired.
2. **Random string** with a uniqueness check. Needs a retry loop under
   collisions, and one extra read per insert.
3. **Counter-based**: take a database sequence value and base62-encode it.
   Collision-free by construction.
4. **Distributed ID generator** (Snowflake-style). Needed only when no single
   database sequence can serve all writers.

## Decision
Use option 3. A Postgres `BIGSERIAL` gives a unique id, and the code is
`base62(id + 62^5)`. The offset makes every code at least 6 characters.

## Consequences
- No collisions, no retry logic, trivial to reason about.
- Codes are sequential and therefore guessable. Anyone can enumerate links.
- The sequence is a single point of write coordination. This is fine at our
  scale, but stops working if we shard writes across databases.

## Alternatives for later
- Bijective scrambling of the id (e.g. a Feistel permutation) keeps the
  collision-free property but hides the sequence.
- Range allocation: each service instance leases a block of ids (say 10,000)
  from the database and hands them out locally, removing the per-insert
  sequence round trip.

# LinkPulse architecture

LinkPulse is a link shortener with a click-analytics pipeline. It is built in
stages, and each stage introduces one system design idea by hitting a real
limitation of the previous one. Every stage should end with a measurement.

## Current state: Stage 1 (monolith)

```
 Browser (React) --> Fastify API --> PostgreSQL
                        |
                      (Redis provisioned, unused until stage 3)
```

- `POST /api/links` creates a short link.
- `GET /api/links` lists the latest 100 links.
- `GET /:code` counts the click and 302-redirects to the original URL.

### Known limitations (deliberate, to be fixed in later stages)

| Limitation | Why it matters | Fixed in |
| --- | --- | --- |
| Every redirect does a Postgres `UPDATE` | Writes on the hot read path; row-level lock contention on popular links | Stage 3, 4 |
| No caching | Each redirect costs a DB round trip | Stage 3 |
| Click counts are a single counter | No per-country, device or time breakdown | Stage 4 |
| Sequential codes are guessable | Users can enumerate links | See ADR 0001 |
| No auth or rate limiting | Anyone can create unlimited links | Stage 2 |
| Single API instance | One process is a single point of failure | Stage 5 |

## Roadmap

1. **Monolith** (done): end-to-end flow working.
2. **Split into services** behind an nginx gateway: auth, link, redirect.
3. **Cache the redirect path**: in-memory LRU plus Redis, cache-aside, TTLs.
4. **Async click pipeline**: redirect publishes events to Redpanda; a worker
   aggregates into per-link, per-country, per-day rollups.
5. **Scale out**: multiple instances, read replicas, discuss sharding.
6. **Load test and observe**: k6 + Prometheus + Grafana, record before/after.

## Measurement log

Fill this in as stages complete. These numbers are what goes on the resume.

| Stage | Setup | Redirects/sec | p50 | p99 | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | single node, no cache | TBD | TBD | TBD | baseline |

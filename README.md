# LinkPulse

A link shortener with a click-analytics pipeline, built stage by stage to study
system design: caching, async processing, horizontal scaling and load testing.

See [`docs/architecture.md`](docs/architecture.md) for the design and roadmap.

## Layout

```
linkpulse/
├── apps/
│   ├── api/          Fastify + TypeScript service (links + redirect)
│   │   ├── src/
│   │   └── migrations/
│   └── web/          React + Vite dashboard
├── docs/
│   ├── architecture.md
│   └── decisions/    Architecture decision records
├── docker-compose.yml   Postgres + Redis
└── pnpm-workspace.yaml
```

Later stages add `packages/` for shared code and one `apps/` entry per service.

## Prerequisites

- Node 20+
- pnpm 9 (`corepack enable`)
- Docker

## Run it

```bash
cp .env.example .env
pnpm install
pnpm infra:up          # start Postgres and Redis
pnpm db:migrate        # create tables
pnpm dev:api           # API on http://localhost:3000
pnpm dev:web           # dashboard on http://localhost:5173
```

## Try the API

```bash
curl -X POST localhost:3000/api/links \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com"}'

curl -i localhost:3000/<code>      # expect a 302
```

## Checks

```bash
pnpm typecheck
pnpm test
```

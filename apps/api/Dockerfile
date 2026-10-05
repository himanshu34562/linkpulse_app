FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
RUN pnpm install --filter @linkpulse/api...
COPY tsconfig.base.json ./
COPY apps/api apps/api
RUN pnpm --filter @linkpulse/api build

FROM node:20-alpine
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app/apps/api
CMD ["node", "dist/server.js"]

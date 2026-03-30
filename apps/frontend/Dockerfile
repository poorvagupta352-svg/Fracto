# Frontend Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter frontend...

FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter frontend build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/frontend/.next ./.next
COPY --from=build /app/apps/frontend/public ./public
COPY --from=build /app/apps/frontend/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3001
CMD ["pnpm", "start", "--", "--port", "3001"]

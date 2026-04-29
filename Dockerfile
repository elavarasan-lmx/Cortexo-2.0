# ─── Stage 1: Build API ───────────────────────────────────────────────────────
FROM node:20-alpine AS api-builder
WORKDIR /app

# Copy workspace files
COPY package.json package-lock.json turbo.json ./
COPY packages/config ./packages/config
COPY packages/db ./packages/db
COPY apps/api ./apps/api

# Install dependencies
RUN npm ci

# Build
RUN npx turbo run build --filter=@cortexo/db
RUN npx turbo run build --filter=@cortexo/api

# ─── Stage 2: Build Web ───────────────────────────────────────────────────────
FROM node:20-alpine AS web-builder
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/config ./packages/config
COPY packages/db ./packages/db
COPY apps/web ./apps/web

RUN npm ci

ARG NEXT_PUBLIC_API_URL=http://localhost:4000/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npx turbo run build --filter=@cortexo/web

# ─── Stage 3: API Runtime ─────────────────────────────────────────────────────
FROM node:20-alpine AS api
WORKDIR /app

RUN addgroup -S cortexo && adduser -S cortexo -G cortexo
COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/packages ./packages
COPY --from=api-builder /app/apps/api/dist ./apps/api/dist
COPY --from=api-builder /app/apps/api/package.json ./apps/api/package.json

USER cortexo
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]

# ─── Stage 4: Web Runtime ─────────────────────────────────────────────────────
FROM node:20-alpine AS web
WORKDIR /app

RUN addgroup -S cortexo && adduser -S cortexo -G cortexo
COPY --from=web-builder /app/apps/web/.next ./apps/web/.next
COPY --from=web-builder /app/apps/web/public ./apps/web/public
COPY --from=web-builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=web-builder /app/node_modules ./node_modules

USER cortexo
EXPOSE 3000
CMD ["node", "apps/web/node_modules/.bin/next", "start", "apps/web", "-p", "3000"]

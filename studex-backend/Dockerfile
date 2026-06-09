# ─── Stage 1: Builder ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci

RUN npx prisma generate

COPY tsconfig.json .
COPY src ./src
RUN npm run build

# ─── Stage 2: Runner ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist            ./dist
COPY --from=builder /app/node_modules   ./node_modules
COPY --from=builder /app/prisma         ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY package.json .

EXPOSE 3001

# migrate deploy lalu start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

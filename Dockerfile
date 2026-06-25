# Production Dockerfile for TanStack Start app (self-hosted)
# Builds with Nitro node_server preset and runs on Node 20.

FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache bash curl unzip libstdc++ \
  && curl -fsSL https://bun.sh/install | bash \
  && ln -s /root/.bun/bin/bun /usr/local/bin/bun

# Copy BOTH old and new bun lock formats + npm lock if present
COPY package.json bun.lock* bun.lockb* package-lock.json* ./

RUN if [ -f bun.lock ] || [ -f bun.lockb ]; then \
      bun install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi

COPY . .

ENV NITRO_PRESET=node_server
RUN if [ -f bun.lock ] || [ -f bun.lockb ]; then bun run build; else npm run build; fi

# ---------- Runtime image ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy Nitro build output. .output/server/package.json lists every external
# dep (including the h3-v2 npm-alias) — install them here for runtime.
COPY --from=builder /app/.output ./.output

RUN cd .output/server && npm install --omit=dev --no-audit --no-fund --legacy-peer-deps

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

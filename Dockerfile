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

# The compiled server imports TanStack's h3 alias (`h3-v2`). Nitro's generated
# .output/server/package.json can omit that npm-alias, so installing only from
# .output/server is not reliable. Copy the exact dependency tree produced from
# bun.lock instead; Node will resolve runtime imports from /app/node_modules.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

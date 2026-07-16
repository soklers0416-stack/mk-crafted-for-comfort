# Production Dockerfile for TanStack Start app (self-hosted)
# Builds with Nitro node_server preset and runs on Node 20.

FROM public.ecr.aws/docker/library/node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache bash curl unzip libstdc++ \
  && curl -fsSL https://bun.sh/install | bash \
  && ln -s /root/.bun/bin/bun /usr/local/bin/bun

COPY package.json bun.lock* bun.lockb* package-lock.json* ./

RUN if [ -f bun.lock ] || [ -f bun.lockb ]; then \
      bun install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi

COPY . .

# The self-hosted server keeps production values in .env.production.
# Copy it to .env during the image build so Vite inlines the same values that
# the running container receives through docker compose env_file.
RUN if [ -f .env.production ] && [ ! -f .env ]; then cp .env.production .env; fi

ENV NITRO_PRESET=node_server
RUN if [ -f bun.lock ] || [ -f bun.lockb ]; then bun run build; else npm run build; fi

# ---------- Runtime image ----------
FROM public.ecr.aws/docker/library/node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

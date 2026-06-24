       # Production Dockerfile for TanStack Start app (self-hosted on TimeWeb)
       # Builds with Nitro node-server preset and runs on Node 20.

       FROM node:20-alpine AS builder
       WORKDIR /app

       # Install bun (used by Lovable template) — falls back to npm if not needed
       RUN apk add --no-cache bash curl unzip libstdc++ \
         && curl -fsSL https://bun.sh/install | bash \
         && ln -s /root/.bun/bin/bun /usr/local/bin/bun

       COPY package.json bun.lockb* package-lock.json* ./
       RUN if [ -f bun.lockb ]; then bun install --frozen-lockfile; \
           else npm install --legacy-peer-deps; fi

       COPY . .

       # Build with Node server preset so output runs on a normal Node process
       ENV NITRO_PRESET=node_server
       RUN if [ -f bun.lockb ]; then bun run build; else npm run build; fi

       # ---------- Runtime image ----------
       FROM node:20-alpine AS runner
       WORKDIR /app
       ENV NODE_ENV=production
       ENV PORT=3000
       ENV HOST=0.0.0.0

       COPY --from=builder /app/.output ./.output

       EXPOSE 3000
       CMD ["node", ".output/server/index.mjs"]

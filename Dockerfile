# syntax=docker/dockerfile:1

# Node 22.13+ is required for the built-in SQLite module.
FROM node:22-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS build
ENV CI=true
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# The build opens the database while prerendering. Keep that file out of the image.
RUN TRASHIFY_DB_PATH=/tmp/build.sqlite pnpm build

FROM base AS run
ENV NODE_ENV=production \
    PORT=3000 \
    TRASHIFY_DB_PATH=/data/trashify.sqlite
# Mount a persistent volume at /data. It must be writable by the node user (uid 1000).
RUN mkdir /data && chown node:node /data
COPY --from=build /app/package.json /app/next.config.ts ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build /app/public ./public
# Operator commands: docker compose exec trashify node scripts/access.mjs ...
COPY --from=build /app/lib/storage.mjs ./lib/storage.mjs
COPY --from=build /app/scripts/access.mjs ./scripts/access.mjs
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/privacy').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
# Run node directly so the server receives SIGTERM and shuts down cleanly.
CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0"]

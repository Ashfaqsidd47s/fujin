# Self-hosted docs site + registry.
#
# Build from the repository root (the app needs the whole workspace):
#   docker build -f apps/www/Dockerfile --build-arg NEXT_PUBLIC_SITE_URL=https://ui.example.com -t fujin-www .
#   docker run -p 3000:3000 fujin-www

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS build
RUN npm install -g pnpm@11.18.0
WORKDIR /repo

# Install with only the manifests first so the layer is cached.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/www/package.json apps/www/
COPY packages/schema/package.json packages/schema/
COPY packages/mcp/package.json packages/mcp/
COPY packages/cli/package.json packages/cli/
COPY templates/next/package.json templates/next/
COPY templates/react/package.json templates/react/
# fumadocs-mdx runs on postinstall and needs its config and content.
COPY apps/www/source.config.ts apps/www/
COPY apps/www/content apps/www/content
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter www...

COPY . .

ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=www

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /repo/apps/www/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /repo/apps/www/.next/static ./apps/www/.next/static
COPY --from=build --chown=nextjs:nodejs /repo/apps/www/public ./apps/www/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/r/registry.json > /dev/null || exit 1

CMD ["node", "apps/www/server.js"]

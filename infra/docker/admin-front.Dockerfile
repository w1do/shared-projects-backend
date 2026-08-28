# Прод-образ панели управления (frontends/admin): multi-stage bun build → standalone next.
# Контекст сборки — frontends/admin (см. infra/compose/compose.yaml).
# NEXT_PUBLIC_* фиксируются на этапе сборки: дефолты same-origin (панель и API за одним gateway).
FROM oven/bun:1.2.21-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_ADMIN_DATA_SOURCE=api
ARG NEXT_PUBLIC_ADMIN_API_BASE_URL=
ENV NEXT_PUBLIC_ADMIN_DATA_SOURCE=${NEXT_PUBLIC_ADMIN_DATA_SOURCE} \
    NEXT_PUBLIC_ADMIN_API_BASE_URL=${NEXT_PUBLIC_ADMIN_API_BASE_URL} \
    BUILD_STANDALONE=1

RUN bun run build

FROM oven/bun:1.2.21-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["bun", "server.js"]

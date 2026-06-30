# =============================================================================
# GEMA - Dockerfile para gema-frontend (Entorno de Producción)
# =============================================================================

# --- Etapa Base ---
FROM node:20-alpine AS base
WORKDIR /app
# Se requiere libc6-compat en imágenes alpine para que dependencias nativas funcionen correctamente.
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# --- Etapa 1: Instalación de todas las dependencias (desarrollo + producción) ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Etapa 2: Construcción de la aplicación (Build) ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Deshabilitar la telemetría de Next.js durante el build.
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- Etapa 3: Instalación de dependencias de producción únicamente ---
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# --- Etapa 4: Imagen de producción final ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Crear usuario y grupo no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar artefactos construidos y dependencias de producción
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Cambiar al usuario no-root
USER nextjs

EXPOSE 3000

# Comando para iniciar la aplicación Next.js en modo producción
CMD ["npx", "next", "start"]

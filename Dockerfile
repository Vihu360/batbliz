# ---- base -------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
# Prisma query engine needs openssl on alpine
RUN apk add --no-cache openssl libc6-compat

# ---- builder: full deps, used only to generate the Prisma client ------
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
# schema.prisma writes the client to ./generated/prisma
RUN npx prisma generate

# ---- prod-deps: runtime dependencies only -----------------------------
# Do NOT add --omit=peer here: it strips socket.io-adapter, which socket.io
# genuinely needs at runtime.
#
# @prisma/client declares the `prisma` CLI and `typescript` as *optional
# peers*, so --omit=dev leaves them in. They are build-time only - the
# generated client talks to the query engine in ./generated/prisma - so they
# are removed explicitly below along with the CLI-only deps they pull in.
FROM base AS proddeps
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
COPY package.json package-lock.json ./
RUN npm ci --omit=dev  && rm -rf node_modules/prisma            node_modules/typescript            node_modules/effect            node_modules/fast-check            node_modules/web-streams-polyfill            node_modules/.bin/prisma            node_modules/.bin/tsc            node_modules/.bin/tsserver  && npm cache clean --force

# ---- runner -----------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

# --chown on COPY avoids a second full-size layer from `RUN chown -R`
COPY --from=proddeps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder  --chown=node:node /app/generated    ./generated
COPY --chown=node:node package.json package-lock.json tsconfig.json ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node db ./db
COPY --chown=node:node src ./src

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# exec form + direct binary so SIGTERM reaches the process (no npx wrapper)
CMD ["node_modules/.bin/tsx", "src/server.ts"]

# The canonical Svelte build and native PNG renderer use the committed lockfile.
# Digest pins the multi-platform Node 22 image; update deliberately with CI evidence.
FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --engine-strict
COPY index.html vite.config.js ./
COPY scripts ./scripts
COPY src ./src
COPY public ./public
COPY server ./server
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=8080 XDG_CACHE_HOME=/tmp/.cache
RUN apt-get update && apt-get install -y --no-install-recommends fonts-dejavu-core fontconfig \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /data && chown node:node /data
COPY --from=frontend-builder --chown=node:node /app/dist ./dist
COPY --from=frontend-builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node server ./server
COPY --from=frontend-builder /app/public/fonts /usr/local/share/fonts/liquidity
RUN fc-cache -f
USER node
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/readyz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]

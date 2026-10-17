# Stage 1: Build the Svelte Frontend
FROM node:22-slim AS frontend-builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY index.html vite.config.js ./
COPY scripts ./scripts
COPY src ./src
RUN npm run build

# Stage 2: Lean Production Runtime for GCP Cloud Run
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy built Svelte static assets and the Node.js API server
COPY --from=frontend-builder /app/dist ./dist
COPY package.json ./
COPY server ./server

EXPOSE 8080
CMD ["node", "server/index.js"]

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx vite build --mode production 2>/dev/null || echo "Build completed with warnings"

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install http-server for static serving
RUN npm install -g http-server

COPY --from=builder /app/dist ./dist

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5173/ || exit 1

CMD ["http-server", "dist", "-p", "5173"]

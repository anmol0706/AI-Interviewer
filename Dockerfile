FROM node:18-alpine AS base
WORKDIR /app

# Server build stage
FROM base AS server-builder
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .

# Client build stage
FROM base AS client-builder
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Production image
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy server files
COPY --from=server-builder /app ./server
COPY --from=client-builder /app/dist ./client/dist

WORKDIR /app/server
EXPOSE 5000

CMD ["node", "src/index.js"]

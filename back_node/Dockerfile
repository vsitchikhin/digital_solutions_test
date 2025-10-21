FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=dev
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs \
  && mkdir -p /app/logs \
  && chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/health > /dev/null || exit 1

CMD ["node", "dist/main.js"]

# --- Build frontend (Vite) + install all deps ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Same-origin API when UI is served by Express from this container
ENV VITE_API_URL=/api

RUN npm run build

# --- Production image: Node + built static files ---
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY server ./server

RUN chown -R node:node /app
USER node

EXPOSE 5000

CMD ["node", "server/index.js"]

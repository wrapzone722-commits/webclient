# Сборка SPA (Vite + React)
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Раздача статики через nginx (SPA: маршруты → index.html)
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

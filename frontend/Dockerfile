FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --no-audit --no-fund --prefer-offline

COPY . .

RUN npm run build

FROM nginx:alpine

RUN adduser -D -u 1001 nginxuser

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /var/cache/nginx /var/log/nginx /tmp && \
    sed -i 's|^pid .*;|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf && \
    chown -R nginxuser:0 /usr/share/nginx/html /var/cache/nginx /var/log/nginx /tmp /etc/nginx/conf.d && \
    chmod -R g+w /usr/share/nginx/html /var/cache/nginx /var/log/nginx /tmp

USER nginxuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q -O - http://localhost:8080/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]

FROM node:17.0.0-alpine as builder

WORKDIR /workdir

COPY . .

RUN npm ci \
    && export NODE_OPTIONS=--openssl-legacy-provider \
    && npm run build

FROM nginx:1.23.4-alpine

COPY --from=builder /workdir /usr/share/nginx/html

COPY --from=builder /workdir/nginx.conf /etc/nginx/conf.d/default.conf

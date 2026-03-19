FROM node:24.12.0-alpine3.22 AS build
RUN npm i -g pnpm@10.28.0
WORKDIR /app/src
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . ./
RUN pnpm run build --configuration production

FROM nginxinc/nginx-unprivileged:mainline-alpine3.23-otel

COPY --chown=nginx:nginx --from=build /app/src/dist/*/browser /usr/share/nginx/html
USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

# --- build stage ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY tsconfig.json tsconfig.app.json tsconfig.spec.json angular.json ngsw-config.json ./
COPY src ./src
COPY theme ./theme

RUN npx ng build --configuration production

# --- runtime stage ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/factory /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

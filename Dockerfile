# Etapa 1: Instalación de dependencias en un entorno de desarrollo
FROM node:20-alpine as dev-deps
WORKDIR /app
COPY package.json package.json
RUN npm install --legacy-peer-deps

# Etapa 2: Construcción de la aplicación Angular
FROM node:20-alpine as builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --configuration=production

# Etapa 3: Preparación del entorno de producción con Nginx
FROM nginx:alpine as prod
EXPOSE 80
COPY --from=builder /app/dist/servo-sync-web/browser /usr/share/nginx/html
RUN rm etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
 
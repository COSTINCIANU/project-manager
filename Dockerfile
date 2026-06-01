# Étape 1 — Build de l'application React
FROM node:22-alpine AS build

# Dossier de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Variable d'environnement pour l'API
ARG VITE_API_URL=http://localhost:8080/api

# Build de l'application
RUN npm run build

# Étape 2 — Serveur Nginx pour servir le build
FROM nginx:alpine

# Copie du build React vers Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration Nginx pour React Router
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Port exposé
EXPOSE 80

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]
# ==========================================================================
# Dockerfile — Frontend Angular (ai-crm / Zuwwar)
# Build multi-stage : compile l'app Angular, puis la sert avec Nginx.
# ==========================================================================

# ---- Étape 1 : build Angular -------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Le vrai projet Angular vit dans artifacts/ai-crm (pas à la racine du repo)
# On copie d'abord uniquement les manifests pour profiter du cache Docker
# (les dépendances ne sont réinstallées que si package*.json changent)
COPY artifacts/ai-crm/package.json artifacts/ai-crm/package-lock.json ./
RUN npm ci

# Puis le reste du code source de l'app Angular
COPY artifacts/ai-crm/. .

# "ng build" utilise la configuration "production" par défaut
# (voir angular.json -> defaultConfiguration: "production")
# Sortie dans dist/public (voir angular.json -> outputPath.browser)
RUN npm run build

# ---- Étape 2 : image finale (Nginx) -------------------------------------
FROM nginx:1.27-alpine

# On retire la config par défaut et on la remplace par notre template
RUN rm -f /etc/nginx/conf.d/default.conf

# Fichiers statiques buildés (index.html, JS, CSS...)
COPY --from=build /app/dist/public /usr/share/nginx/html

# Template Nginx — substitué au démarrage du conteneur par l'image officielle
# nginx (envsubst automatique sur tout fichier dans /etc/nginx/templates/*.template)
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Valeurs par défaut, surchargeables via docker-compose / docker run -e
ENV BACKEND_URL=http://localhost:8081
ENV AI_SERVICE_URL=http://localhost:8000

EXPOSE 80

# L'entrypoint par défaut de l'image nginx:alpine gère déjà l'envsubst
# des templates + le démarrage de nginx -g 'daemon off;'
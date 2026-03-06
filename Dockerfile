FROM node:20-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

EXPOSE 4200

# --host 0.0.0.0 pour être accessible depuis l'extérieur du conteneur
CMD ["node", "node_modules/@angular/cli/bin/ng.js", "serve", "--host", "0.0.0.0", "--port", "4200"]

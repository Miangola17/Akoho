FROM node:20-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install --omit=dev

# Copier le code source
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]

# 1. Image-Basis
FROM node:20-alpine

# 2. Arbeitsverzeichnis im Container
WORKDIR /app

# 3. Alle package.json Dateien kopieren
COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
COPY packages/shared/package*.json ./packages/shared/

# 4. Alle Abhängigkeiten installieren + PM2 global im Container installieren
RUN npm install && npm install -g pm2

# 5. Den Quellcode kopieren, den der Server zum Laufen braucht
COPY release ./release
COPY packages/server/ ./packages/server/
COPY packages/shared/ ./packages/shared/

# 6. Wir wechseln in den Server-Ordner und bauen das TypeScript zu JavaScript
WORKDIR /app/packages/server
RUN npm run build

# 7. Port freigeben
WORKDIR /app
EXPOSE 7050

# 8. WICHTIG: pm2-runtime hält den Container am Leben!
CMD ["pm2-runtime", "start", "out/server/index.js"]
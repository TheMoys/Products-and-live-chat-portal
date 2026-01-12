FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Exponer puertos
EXPOSE 3000 5173

# Usar el script "dev" de tu package.json
CMD ["npm", "run", "dev"]
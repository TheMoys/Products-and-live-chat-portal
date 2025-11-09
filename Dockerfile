FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias del backend
RUN npm install

# Copiar código fuente (SIN .env)
COPY src/ ./src/
COPY vite.config.js ./

# Instalar dependencias del frontend y construir
WORKDIR /app/src/frontend
RUN npm install
RUN npm run build

# Volver a la raíz
WORKDIR /app

# Exponer puerto
EXPOSE 3000

# Comando para iniciar
CMD ["node", "src/server.js"]
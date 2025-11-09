FROM node:18-alpine

WORKDIR /app

# Copiar package.json del root
COPY package*.json ./

# Instalar dependencias del backend
RUN npm install

# Copiar todo el código fuente
COPY . .

# Construir el frontend
WORKDIR /app/src/frontend

# Instalar dependencias del frontend
RUN npm install

# Construir frontend (genera /app/dist)
RUN npm run build

# Volver a la raíz
WORKDIR /app

# Verificar que dist existe (para debugging)
RUN ls -la /app/dist || echo "⚠️ dist no encontrado"

# Exponer puerto
EXPOSE 3000

# Comando para iniciar
CMD ["node", "src/server.js"]
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar TODAS las dependencias
COPY package*.json ./
RUN npm install

# Copiar todo el código fuente
COPY src/ ./src/
COPY .env ./
COPY vite.config.js ./

# Crear carpeta uploads
RUN mkdir -p uploads

EXPOSE 3000 5173

# Iniciar con el script dev que ya tienes configurado
CMD ["npm", "run", "dev"]
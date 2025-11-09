# 🎮 Arcane Archives - Product & Live Chat Portal

Portal full-stack de gestión de productos gaming con chat en tiempo real. Desarrollado con **Node.js/Express** + **MongoDB** en el backend y **Vue 3** + **Vite** + **Pinia** en el frontend.

---

## 📋 Descripción del Proyecto

**Arcane Archives** es una aplicación web que combina:

- **Catálogo de Productos**: Sistema CRUD completo para gestionar productos gaming (videojuegos, accesorios, etc.)
- **Chat en Tiempo Real**: Sistema de mensajería instantánea con Socket.IO
- **Autenticación JWT**: Sistema seguro de login/registro con roles (admin/user)
- **Arquitectura Moderna**: Separación clara entre frontend y backend con API REST

### Características Principales

✅ Autenticación con JWT y roles (admin/usuario)  
✅ CRUD de productos con subida de imágenes (Base64 o URL)  
✅ Chat en tiempo real con Socket.IO  
✅ Lista de usuarios conectados en tiempo real  
✅ Historial de mensajes persistente en MongoDB  
✅ Proxy configurado en Vite para desarrollo  
✅ Docker Compose listo para despliegue

---

## 🏗️ Arquitectura Técnica

### Backend (Node.js + Express)

**Punto de entrada**: [`src/server.js`](src/server.js)

- **Framework**: Express.js con HTTP server
- **Base de datos**: MongoDB (Mongoose ODM)
- **WebSockets**: Socket.IO para chat en tiempo real
- **Autenticación**: JWT (JSON Web Tokens)
- **Configuración**: Dotenv para variables de entorno

#### Modelos de Datos

- [`src/models/Users.js`](src/models/Users.js) - Usuarios (username, email, password hash, role)
- [`src/models/Products.js`](src/models/Products.js) - Productos (title, description, price, stock, imageUrl/imageData)
- [`src/models/Message.js`](src/models/Message.js) - Mensajes del chat (user, username, text, createdAt)

#### Rutas API

- [`src/routes/authRoutes.js`](src/routes/authRoutes.js) - `/api/auth/*` (register, login, verify)
- [`src/routes/productRoutes.js`](src/routes/productRoutes.js) - `/api/products/*` (GET, POST, PUT, DELETE)
- [`src/routes/chatRoutes.js`](src/routes/chatRoutes.js) - `/api/chat/messages` (historial de mensajes)

#### Middleware

[`src/middleware/authenticateJWT.js`](src/middleware/authenticateJWT.js) implementa:
- `authenticateJWT` - Verifica token en rutas HTTP
- `verifySocketJWT` - Verifica token en conexiones Socket.IO
- `authorizeRole` - Controla acceso por rol de usuario

#### Configuración

[`src/config.js`](src/config.js) centraliza las variables de entorno:
- `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_CODE`

---

### Frontend (Vue 3 + Vite)

**Punto de entrada**: [`src/frontend/src/main.js`](src/frontend/src/main.js)

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite (HMR ultra-rápido)
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **WebSockets**: Socket.IO Client

#### Estructura de Carpetas

```
src/frontend/
├── src/
│   ├── views/          # Páginas/Vistas
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── ProductsView.vue
│   │   └── ChatView.vue
│   ├── stores/         # Estado global (Pinia)
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── chat.js
│   ├── services/       # Lógica de negocio
│   │   ├── axios.js
│   │   ├── socketService.js
│   │   ├── productService.js
│   │   └── chatService.js
│   ├── router/
│   │   └── index.js    # Configuración de rutas
│   ├── assets/
│   │   ├── main.css
│   │   └── styles/     # CSS modular
│   └── App.vue
├── index.html
└── package.json
```

#### Servicios Principales

- [`src/frontend/src/services/axios.js`](src/frontend/src/services/axios.js) - Instancia configurada de Axios con interceptores
- [`src/frontend/src/services/socketService.js`](src/frontend/src/services/socketService.js) - Cliente Socket.IO (conexión, eventos de chat)
- [`src/frontend/src/services/productService.js`](src/frontend/src/services/productService.js) - CRUD de productos
- [`src/frontend/src/services/chatService.js`](src/frontend/src/services/chatService.js) - Obtención de historial de mensajes

#### Stores (Pinia)

- [`src/frontend/src/stores/auth.js`](src/frontend/src/stores/auth.js) - Gestión de autenticación (login, register, logout, verificación de token)
- [`src/frontend/src/stores/products.js`](src/frontend/src/stores/products.js) - Estado de productos (lista, loading, error)
- [`src/frontend/src/stores/chat.js`](src/frontend/src/stores/chat.js) - Mensajes del chat

#### Router

[`src/frontend/src/router/index.js`](src/frontend/src/router/index.js) define:
- Rutas protegidas con `meta: { requiresAuth: true }`
- Rutas públicas con `meta: { guest: true }`
- Guard global que verifica autenticación en cada navegación

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (local o Docker)

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Products-and-live-chat-portal
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y edita los valores:

```bash
cp .env.example .env
```

Contenido del [`.env`](.env):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/portal-productos
JWT_SECRET=tu_clave_super_secreta_cambiame
JWT_EXPIRES_IN=12h
ADMIN_CODE=admin1234
```

**Variables importantes**:
- `MONGODB_URI`: URI de conexión a MongoDB
- `JWT_SECRET`: Clave secreta para firmar tokens (¡cámbiala en producción!)
- `ADMIN_CODE`: Código para registrar usuarios admin (opcional)

### 4. Levantar MongoDB (Local)

Si usas MongoDB local:

```bash
mongod --dbpath /ruta/a/tu/db
```

O con Docker:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

---

## 🏃 Modo Desarrollo

El proyecto usa **concurrently** para ejecutar backend y frontend simultáneamente.

```bash
npm run dev
```

Esto ejecuta:
- **Backend**: `nodemon src/server.js` en `http://localhost:3000`
- **Frontend**: `vite` en `http://localhost:5173`

El frontend usa proxy configurado en [`vite.config.js`](vite.config.js) para redirigir `/api` y `/socket.io` al backend.

### Scripts Disponibles

```json
"dev": "concurrently \"npm run server\" \"npm run client\"",
"server": "nodemon src/server.js",
"client": "vite",
"build": "vite build",
"preview": "vite preview"
```

---

## 🐳 Despliegue con Docker

El proyecto incluye [`Dockerfile`](Dockerfile) y [`docker-compose.yml`](docker-compose.yml) listos para usar.

### Levantar con Docker Compose

```bash
docker-compose up --build
```

Esto crea:
- Contenedor **MongoDB** (puerto `27018` → `27017`)
- Contenedor **App** (puertos `3000` y `5173`)

### Servicios Configurados

Según [`docker-compose.yml`](docker-compose.yml):

```yaml
services:
  mongodb:
    image: mongo:7
    ports:
      - "27018:27017"
    volumes:
      - mongodb_data:/data/db

  app:
    build: .
    ports:
      - "3000:3000"
      - "5173:5173"
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://mongodb:27017/portal-productos
```

---

## 🔐 Autenticación y Roles

### Registro de Usuario Normal

Endpoint: `POST /api/auth/register`

```json
{
  "username": "jugador1",
  "email": "jugador@example.com",
  "password": "pass123"
}
```

### Registro de Administrador

Incluye el campo `adminCode` con el valor de `ADMIN_CODE` del [`.env`](.env):

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "adminCode": "admin1234"
}
```

El código se valida en [`src/routes/authRoutes.js`](src/routes/authRoutes.js).

### Login

Endpoint: `POST /api/auth/login`

```json
{
  "emailOrUsername": "jugador1",
  "password": "pass123"
}
```

Respuesta:

```json
{
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "username": "jugador1",
    "email": "jugador@example.com",
    "role": "user"
  }
}
```

### Verificación de Token

Endpoint: `GET /api/auth/verify`  
Header: `Authorization: Bearer <token>`

El frontend verifica automáticamente el token en [`src/frontend/src/stores/auth.js`](src/frontend/src/stores/auth.js) al cargar la app.

---

## 📦 API de Productos

### Listar Productos

```http
GET /api/products
```

No requiere autenticación.

### Crear Producto (Admin)

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Cyberpunk 2077",
  "description": "RPG de mundo abierto",
  "price": 59.99,
  "stock": 100,
  "imageUrl": "https://example.com/image.jpg"  // O usar imageData (Base64)
}
```

Implementado en [`src/routes/productRoutes.js`](src/routes/productRoutes.js).

### Actualizar Producto (Admin)

```http
PUT /api/products/:id
Authorization: Bearer <token>
```

### Eliminar Producto (Admin)

```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

---

## 💬 Sistema de Chat

### WebSocket (Socket.IO)

**Conexión**: El cliente se conecta en [`src/frontend/src/services/socketService.js`](src/frontend/src/services/socketService.js) enviando el token JWT:

```javascript
const socket = io(BACKEND_URL, {
  auth: {
    token: token
  }
})
```

El servidor verifica el token con [`verifySocketJWT`](src/middleware/authenticateJWT.js) en [`src/server.js`](src/server.js).

### Eventos del Chat

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `connect` | Cliente ← Servidor | Conexión establecida |
| `chat:message` | Cliente → Servidor | Enviar mensaje |
| `chat:message` | Cliente ← Servidor | Recibir mensaje |
| `chat:typing` | Cliente → Servidor | Usuario está escribiendo |
| `chat:stop-typing` | Cliente → Servidor | Usuario dejó de escribir |
| `chat:user-typing` | Cliente ← Servidor | Notificación de typing |
| `chat:user-stop-typing` | Cliente ← Servidor | Notificación de stop typing |
| `chat:users-update` | Cliente ← Servidor | Lista de usuarios conectados |

### Historial de Mensajes

```http
GET /api/chat/messages?limit=50
Authorization: Bearer <token>
```

Devuelve los últimos 50 mensajes (configurado en [`src/routes/chatRoutes.js`](src/routes/chatRoutes.js)).

---

## 🎨 Estilos y Diseño

El proyecto usa una **estética cyberpunk/gaming** con:

- Variables CSS centralizadas en [`src/frontend/src/assets/styles/variables.css`](src/frontend/src/assets/styles/variables.css)
- Colores neón: `--neon-blue`, `--neon-purple`, `--neon-pink`, `--neon-green`
- Animaciones de gradientes y efectos glitch
- Fuentes: **Orbitron** (títulos), **Rajdhani** (cuerpo)

### Archivos CSS Principales

- [`src/frontend/src/assets/main.css`](src/frontend/src/assets/main.css) - Estilos globales
- [`src/frontend/src/assets/styles/auth.css`](src/frontend/src/assets/styles/auth.css) - Login/Registro
- [`src/frontend/src/assets/styles/home.css`](src/frontend/src/assets/styles/home.css) - Página principal
- [`src/frontend/src/assets/styles/products.css`](src/frontend/src/assets/styles/products.css) - Vista de productos
- [`src/frontend/src/assets/styles/chat.css`](src/frontend/src/assets/styles/chat.css) - Vista de chat

---

## 📂 Estructura Completa del Proyecto

```
Products-and-live-chat-portal/
├── src/
│   ├── config.js                 # Configuración de variables de entorno
│   ├── server.js                 # Punto de entrada del backend
│   ├── middleware/
│   │   └── authenticateJWT.js    # Middleware de autenticación
│   ├── models/
│   │   ├── Users.js              # Modelo de usuarios
│   │   ├── Products.js           # Modelo de productos
│   │   └── Message.js            # Modelo de mensajes
│   ├── routes/
│   │   ├── authRoutes.js         # Rutas de autenticación
│   │   ├── productRoutes.js      # Rutas de productos
│   │   └── chatRoutes.js         # Rutas de chat
│   └── frontend/
│       ├── index.html
│       ├── src/
│       │   ├── main.js           # Punto de entrada del frontend
│       │   ├── App.vue           # Componente raíz
│       │   ├── views/            # Páginas/Vistas
│       │   ├── stores/           # Estado global (Pinia)
│       │   ├── services/         # Servicios (axios, socket, etc.)
│       │   ├── router/           # Configuración de rutas
│       │   └── assets/           # Estilos y recursos
├── uploads/                      # Carpeta para archivos subidos
├── .env                          # Variables de entorno
├── .env.example                  # Plantilla de variables
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── vite.config.js                # Configuración de Vite
├── package.json
└── README.md
```

---

## 🔧 Configuración de Vite

El archivo [`vite.config.js`](vite.config.js) configura:

```javascript
export default defineConfig({
  plugins: [vue()],
  root: './src/frontend',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/frontend/src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
```

Esto permite que el frontend en desarrollo redirija las peticiones a `/api` y `/socket.io` al backend sin CORS.

---

**¡Disfruta gestionando tu portal gaming! 🎮✨**
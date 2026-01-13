# Arcane Archives - Product & Live Chat Portal

Portal full-stack de e-commerce gaming con chat en tiempo real, carrito de compras y gestión de pedidos. Desarrollado con **Node.js/Express** + **MongoDB** + **GraphQL** + **Apollo Server** en el backend y **Vue 3** + **Vite** + **Pinia** en el frontend.

---

## 📋 Descripción del Proyecto

**Arcane Archives** es una aplicación web completa de comercio electrónico que combina:

- **Catálogo de Productos**: Sistema CRUD completo para gestionar productos gaming (videojuegos, accesorios, etc.)
- **Carrito de Compras**: Sistema de carrito persistente con gestión de cantidades
- **Sistema de Pedidos**: Checkout completo con seguimiento de estados y direcciones de envío
- **Panel de Administración**: Gestión de usuarios, productos y pedidos con estadísticas
- **Chat en Tiempo Real**: Sistema de mensajería instantánea con Socket.IO
- **API GraphQL**: Consultas y mutaciones para carrito y pedidos
- **API REST**: Endpoints tradicionales para autenticación y productos
- **Autenticación JWT**: Sistema seguro de login/registro con roles (admin/user)

### Características Principales

✅ Autenticación con JWT y roles (admin/usuario)  
✅ CRUD de productos con subida de imágenes (Base64 o URL)  
✅ Carrito de compras persistente en MongoDB  
✅ Sistema completo de checkout y pedidos  
✅ Panel de administración con gestión de usuarios y pedidos  
✅ Estadísticas de pedidos y ventas  
✅ Chat en tiempo real con Socket.IO  
✅ Lista de usuarios conectados en tiempo real  
✅ API GraphQL con Apollo Server  
✅ API REST tradicional  
✅ Historial de mensajes persistente en MongoDB  
✅ Proxy configurado en Vite para desarrollo  
✅ Docker Compose listo para despliegue  
✅ Diseño responsive con estética Steam Gaming

---

## 🏗️ Arquitectura Técnica

### Backend (Node.js + Express)

**Punto de entrada**: [`src/server.js`](src/server.js)

- **Framework**: Express.js con HTTP server
- **Base de datos**: MongoDB (Mongoose ODM)
- **GraphQL**: Apollo Server 3.x integrado con Express
- **WebSockets**: Socket.IO para chat en tiempo real
- **Autenticación**: JWT (JSON Web Tokens)
- **Configuración**: Dotenv para variables de entorno

#### Modelos de Datos

- [`src/models/Users.js`](src/models/Users.js) - Usuarios (username, email, password hash, role)
- [`src/models/Products.js`](src/models/Products.js) - Productos (title, description, price, stock, category, imageUrl/imageData)
- [`src/models/Cart.js`](src/models/Cart.js) - Carritos de compras (user, items, totalAmount)
- [`src/models/Order.js`](src/models/Order.js) - Pedidos (orderNumber, user, items, totalAmount, status, shippingAddress)
- [`src/models/Message.js`](src/models/Message.js) - Mensajes del chat (user, username, text, createdAt)

#### Rutas API REST

- [`src/routes/authRoutes.js`](src/routes/authRoutes.js) - `/api/auth/*` (register, login, verify)
- [`src/routes/productRoutes.js`](src/routes/productRoutes.js) - `/api/products/*` (GET, POST, PUT, DELETE)
- [`src/routes/userRoutes.js`](src/routes/userRoutes.js) - `/api/users/*` (GET all, GET by ID, UPDATE, DELETE)
- [`src/routes/chatRoutes.js`](src/routes/chatRoutes.js) - `/api/chat/messages` (historial de mensajes)

#### GraphQL API

- **Endpoint**: `/graphql`
- **Playground**: Disponible en desarrollo en `http://localhost:3000/graphql`
- [`src/graphql/typeDefs.js`](src/graphql/typeDefs.js) - Schema de GraphQL (tipos, queries, mutations)
- [`src/graphql/resolvers/`](src/graphql/resolvers/) - Resolvers organizados por dominio:
  - `productResolvers.js` - Queries de productos
  - `cartResolvers.js` - Queries y Mutations de carrito
  - `orderResolvers.js` - Queries y Mutations de pedidos

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
│   │   ├── CartView.vue
│   │   ├── CheckoutView.vue
│   │   ├── MyOrdersView.vue
│   │   ├── OrderDetailView.vue
│   │   ├── AdminUsersView.vue
│   │   ├── AdminOrdersView.vue
│   │   ├── ChatView.vue
│   │   └── TestServicesView.vue
│   ├── stores/         # Estado global (Pinia)
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── users.js
│   │   └── chat.js
│   ├── services/       # Lógica de negocio
│   │   ├── axios.js
│   │   ├── graphqlClient.js
│   │   ├── socketService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   ├── userService.js
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
- [`src/frontend/src/services/graphqlClient.js`](src/frontend/src/services/graphqlClient.js) - Cliente Apollo para GraphQL
- [`src/frontend/src/services/socketService.js`](src/frontend/src/services/socketService.js) - Cliente Socket.IO (conexión, eventos de chat)
- [`src/frontend/src/services/productService.js`](src/frontend/src/services/productService.js) - CRUD de productos (REST)
- [`src/frontend/src/services/cartService.js`](src/frontend/src/services/cartService.js) - Gestión de carrito (GraphQL)
- [`src/frontend/src/services/orderService.js`](src/frontend/src/services/orderService.js) - Gestión de pedidos (GraphQL)
- [`src/frontend/src/services/userService.js`](src/frontend/src/services/userService.js) - Gestión de usuarios (REST)
- [`src/frontend/src/services/chatService.js`](src/frontend/src/services/chatService.js) - Obtención de historial de mensajes

#### Stores (Pinia)

- [`src/frontend/src/stores/auth.js`](src/frontend/src/stores/auth.js) - Gestión de autenticación (login, register, logout, verificación de token)
- [`src/frontend/src/stores/products.js`](src/frontend/src/stores/products.js) - Estado de productos (lista, loading, error)
- [`src/frontend/src/stores/cart.js`](src/frontend/src/stores/cart.js) - Estado del carrito de compras
- [`src/frontend/src/stores/orders.js`](src/frontend/src/stores/orders.js) - Estado de pedidos del usuario
- [`src/frontend/src/stores/users.js`](src/frontend/src/stores/users.js) - Gestión de usuarios (admin)
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

## � API GraphQL

El proyecto incluye una API GraphQL completa con Apollo Server para gestión de carrito y pedidos.

**Endpoint**: `http://localhost:3000/graphql`  
**Playground**: Disponible en desarrollo para probar queries y mutations

### Autenticación en GraphQL

Todas las queries y mutations de GraphQL requieren autenticación. Debes incluir el token JWT en el header:

```http
Authorization: Bearer <tu-token-jwt>
```

### Schema de GraphQL

#### Tipos Principales

```graphql
type User {
  id: ID!
  username: String!
  email: String!
  role: String!
  createdAt: String!
}

type Product {
  id: ID!
  title: String!
  description: String!
  price: Float!
  category: String!
  stock: Int!
  imageUrl: String
  imageData: String
  createdAt: String!
}

type CartItem {
  product: Product!
  quantity: Int!
  price: Float!
}

type Cart {
  id: ID!
  user: User!
  items: [CartItem!]!
  updatedAt: String!
  totalAmount: Float
}

type OrderItem {
  product: Product!
  title: String!
  quantity: Int!
  price: Float!
}

type ShippingAddress {
  street: String
  city: String
  state: String
  zipCode: String
  country: String
}

type Order {
  id: ID!
  orderNumber: String!
  user: User!
  items: [OrderItem!]!
  totalAmount: Float!
  status: OrderStatus!
  shippingAddress: ShippingAddress
  createdAt: String!
  updatedAt: String!
}

enum OrderStatus {
  pending
  processing
  shipped
  delivered
  cancelled
}

type OrderStats {
  total: Int!
  pending: Int!
  processing: Int!
  shipped: Int!
  delivered: Int!
  cancelled: Int!
  totalRevenue: Float!
}
```

### Queries

#### 1. Obtener Productos

```graphql
query GetProducts {
  products {
    id
    title
    description
    price
    category
    stock
    imageUrl
    createdAt
  }
}
```

**Con filtros opcionales**:

```graphql
query GetProductsByCategory {
  products(category: "videojuegos") {
    id
    title
    price
    stock
  }
}

query SearchProducts {
  products(search: "cyberpunk") {
    id
    title
    description
    price
  }
}
```

#### 2. Obtener Producto por ID

```graphql
query GetProduct {
  product(id: "producto-id-aqui") {
    id
    title
    description
    price
    stock
    imageUrl
  }
}
```

#### 3. Obtener Carrito del Usuario

```graphql
query GetCart {
  getCart {
    id
    items {
      product {
        id
        title
        price
        imageUrl
      }
      quantity
      price
    }
    totalAmount
    updatedAt
  }
}
```

**Respuesta de ejemplo**:

```json
{
  "data": {
    "getCart": {
      "id": "cart123",
      "items": [
        {
          "product": {
            "id": "prod1",
            "title": "Cyberpunk 2077",
            "price": 59.99,
            "imageUrl": "https://..."
          },
          "quantity": 2,
          "price": 59.99
        }
      ],
      "totalAmount": 119.98,
      "updatedAt": "2026-01-13T10:30:00Z"
    }
  }
}
```

#### 4. Obtener Mis Pedidos

```graphql
query GetMyOrders {
  myOrders {
    id
    orderNumber
    items {
      product {
        id
        title
      }
      title
      quantity
      price
    }
    totalAmount
    status
    shippingAddress {
      street
      city
      state
      zipCode
      country
    }
    createdAt
  }
}
```

#### 5. Obtener Pedido por ID

```graphql
query GetOrder {
  order(id: "order-id-aqui") {
    id
    orderNumber
    user {
      username
      email
    }
    items {
      title
      quantity
      price
    }
    totalAmount
    status
    shippingAddress {
      street
      city
      country
    }
    createdAt
  }
}
```

#### 6. Obtener Todos los Pedidos (Admin)

```graphql
query GetAllOrders {
  allOrders {
    id
    orderNumber
    user {
      username
      email
    }
    totalAmount
    status
    createdAt
  }
}
```

**Con filtro por estado**:

```graphql
query GetPendingOrders {
  allOrders(status: pending) {
    id
    orderNumber
    totalAmount
    createdAt
  }
}
```

#### 7. Obtener Estadísticas de Pedidos (Admin)

```graphql
query GetOrderStats {
  orderStats {
    total
    pending
    processing
    shipped
    delivered
    cancelled
    totalRevenue
  }
}
```

**Respuesta de ejemplo**:

```json
{
  "data": {
    "orderStats": {
      "total": 150,
      "pending": 12,
      "processing": 25,
      "shipped": 30,
      "delivered": 78,
      "cancelled": 5,
      "totalRevenue": 45670.50
    }
  }
}
```

### Mutations

#### 1. Agregar Producto al Carrito

```graphql
mutation AddToCart {
  addToCart(productId: "producto-id-aqui", quantity: 2) {
    id
    items {
      product {
        id
        title
        price
      }
      quantity
      price
    }
    totalAmount
  }
}
```

**Con variables**:

```graphql
mutation AddToCart($productId: ID!, $quantity: Int!) {
  addToCart(productId: $productId, quantity: $quantity) {
    id
    items {
      product {
        title
      }
      quantity
    }
    totalAmount
  }
}
```

Variables:
```json
{
  "productId": "67843e9c4fbb86c3d7482d9d",
  "quantity": 1
}
```

#### 2. Actualizar Cantidad de Producto en Carrito

```graphql
mutation UpdateCartItem {
  updateCartItem(productId: "producto-id-aqui", quantity: 3) {
    id
    items {
      product {
        title
      }
      quantity
      price
    }
    totalAmount
  }
}
```

**Con variables**:

```graphql
mutation UpdateCartItem($productId: ID!, $quantity: Int!) {
  updateCartItem(productId: $productId, quantity: $quantity) {
    id
    totalAmount
  }
}
```

Variables:
```json
{
  "productId": "67843e9c4fbb86c3d7482d9d",
  "quantity": 5
}
```

#### 3. Eliminar Producto del Carrito

```graphql
mutation RemoveFromCart {
  removeFromCart(productId: "producto-id-aqui") {
    id
    items {
      product {
        title
      }
      quantity
    }
    totalAmount
  }
}
```

#### 4. Vaciar Carrito

```graphql
mutation ClearCart {
  clearCart
}
```

**Respuesta**: `true` si se vació correctamente

#### 5. Crear Pedido (Checkout)

```graphql
mutation CreateOrder {
  createOrder(
    shippingAddress: {
      street: "Calle Principal 123"
      city: "Madrid"
      state: "Madrid"
      zipCode: "28001"
      country: "España"
    }
  ) {
    id
    orderNumber
    items {
      title
      quantity
      price
    }
    totalAmount
    status
    shippingAddress {
      street
      city
      country
    }
    createdAt
  }
}
```

**Con variables**:

```graphql
mutation CreateOrder($shippingAddress: ShippingAddressInput!) {
  createOrder(shippingAddress: $shippingAddress) {
    id
    orderNumber
    totalAmount
    status
  }
}
```

Variables:
```json
{
  "shippingAddress": {
    "street": "Av. Siempre Viva 742",
    "city": "Springfield",
    "state": "Oregon",
    "zipCode": "97403",
    "country": "USA"
  }
}
```

#### 6. Actualizar Estado de Pedido (Admin)

```graphql
mutation UpdateOrderStatus {
  updateOrderStatus(orderId: "order-id-aqui", status: shipped) {
    id
    orderNumber
    status
    updatedAt
  }
}
```

**Con variables**:

```graphql
mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
  updateOrderStatus(orderId: $orderId, status: $status) {
    id
    orderNumber
    status
  }
}
```

Variables:
```json
{
  "orderId": "67843f1a4fbb86c3d7482da5",
  "status": "delivered"
}
```

**Estados disponibles**: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

### Ejemplo Completo de Flujo de Compra

```graphql
# 1. Ver productos disponibles
query {
  products {
    id
    title
    price
    stock
  }
}

# 2. Agregar productos al carrito
mutation {
  addToCart(productId: "prod1", quantity: 2) {
    totalAmount
  }
}

mutation {
  addToCart(productId: "prod2", quantity: 1) {
    totalAmount
  }
}

# 3. Ver carrito
query {
  getCart {
    items {
      product {
        title
      }
      quantity
      price
    }
    totalAmount
  }
}

# 4. Actualizar cantidad si es necesario
mutation {
  updateCartItem(productId: "prod1", quantity: 3) {
    totalAmount
  }
}

# 5. Crear pedido (checkout)
mutation {
  createOrder(
    shippingAddress: {
      street: "Calle Test 123"
      city: "Madrid"
      zipCode: "28001"
      country: "España"
    }
  ) {
    orderNumber
    totalAmount
    status
  }
}

# 6. Ver mis pedidos
query {
  myOrders {
    orderNumber
    totalAmount
    status
    createdAt
  }
}
```

### Manejo de Errores en GraphQL

Las respuestas de GraphQL incluyen un array de `errors` cuando algo falla:

```json
{
  "errors": [
    {
      "message": "Producto no encontrado",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

**Errores comunes**:
- `UNAUTHENTICATED` - Token no válido o no proporcionado
- `NOT_FOUND` - Recurso no encontrado
- `INSUFFICIENT_STOCK` - Stock insuficiente para la compra
- `INVALID_INPUT` - Datos de entrada inválidos
- `CART_EMPTY` - Intento de crear pedido con carrito vacío

---

## �📦 API REST de Productos

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

El proyecto usa una **estética Steam Gaming** moderna con:

- Variables CSS centralizadas en [`src/frontend/src/assets/styles/variables.css`](src/frontend/src/assets/styles/variables.css)
- Paleta de colores Steam: `--steam-blue`, `--steam-green`, `--steam-red`
- Sistema de componentes reutilizables en [`components.css`](src/frontend/src/assets/styles/components.css)
- Animaciones suaves y efectos de hover
- Fuentes: **Motiva Sans** (inspirado en Steam)
- Diseño responsive con breakpoints móvil-first

### Archivos CSS Principales

- [`src/frontend/src/assets/main.css`](src/frontend/src/assets/main.css) - Estilos globales
- [`src/frontend/src/assets/styles/variables.css`](src/frontend/src/assets/styles/variables.css) - Variables CSS (colores, espaciado, fuentes)
- [`src/frontend/src/assets/styles/components.css`](src/frontend/src/assets/styles/components.css) - Componentes reutilizables (botones, modales, inputs, alerts)
- [`src/frontend/src/assets/styles/auth.css`](src/frontend/src/assets/styles/auth.css) - Login/Registro
- [`src/frontend/src/assets/styles/home.css`](src/frontend/src/assets/styles/home.css) - Página principal
- [`src/frontend/src/assets/styles/products.css`](src/frontend/src/assets/styles/products.css) - Vista de productos
- [`src/frontend/src/assets/styles/cart.css`](src/frontend/src/assets/styles/cart.css) - Carrito de compras
- [`src/frontend/src/assets/styles/checkout.css`](src/frontend/src/assets/styles/checkout.css) - Proceso de checkout
- [`src/frontend/src/assets/styles/myOrders.css`](src/frontend/src/assets/styles/myOrders.css) - Lista de pedidos del usuario
- [`src/frontend/src/assets/styles/orderDetails.css`](src/frontend/src/assets/styles/orderDetails.css) - Detalles de pedido
- [`src/frontend/src/assets/styles/adminUsers.css`](src/frontend/src/assets/styles/adminUsers.css) - Gestión de usuarios (admin)
- [`src/frontend/src/assets/styles/adminOrders.css`](src/frontend/src/assets/styles/adminOrders.css) - Gestión de pedidos (admin)
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
│   │   ├── Cart.js               # Modelo de carritos
│   │   ├── Order.js              # Modelo de pedidos
│   │   └── Message.js            # Modelo de mensajes
│   ├── routes/
│   │   ├── authRoutes.js         # Rutas de autenticación
│   │   ├── productRoutes.js      # Rutas de productos
│   │   ├── userRoutes.js         # Rutas de usuarios
│   │   └── chatRoutes.js         # Rutas de chat
│   ├── graphql/
│   │   ├── typeDefs.js           # Schema de GraphQL
│   │   └── resolvers/
│   │       ├── index.js          # Combina todos los resolvers
│   │       ├── productResolvers.js
│   │       ├── cartResolvers.js
│   │       └── orderResolvers.js
│   └── frontend/
│       ├── index.html
│       ├── src/
│       │   ├── main.js           # Punto de entrada del frontend
│       │   ├── App.vue           # Componente raíz
│       │   ├── views/            # Páginas/Vistas
│       │   ├── stores/           # Estado global (Pinia)
│       │   ├── services/         # Servicios (axios, graphql, socket, etc.)
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

Esto permite que el frontend en desarrollo redirija las peticiones a `/api`, `/socket.io` y `/graphql` al backend sin CORS.

---

## 🗺️ Rutas y Vistas del Frontend

### Rutas Públicas (No requieren autenticación)

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/` | HomeView | Página de inicio con información del portal |
| `/login` | LoginView | Formulario de inicio de sesión |
| `/register` | RegisterView | Formulario de registro de usuario |

### Rutas Protegidas (Requieren autenticación)

| Ruta | Vista | Descripción | Rol |
|------|-------|-------------|-----|
| `/products` | ProductsView | Catálogo de productos con CRUD (admin) | Usuario/Admin |
| `/cart` | CartView | Carrito de compras | Usuario/Admin |
| `/checkout` | CheckoutView | Proceso de pago y dirección de envío | Usuario/Admin |
| `/my-orders` | MyOrdersView | Lista de pedidos del usuario | Usuario/Admin |
| `/order/:id` | OrderDetailView | Detalles de un pedido específico | Usuario/Admin |
| `/chat` | ChatView | Chat en tiempo real | Usuario/Admin |

### Rutas de Administración (Solo Admin)

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/admin/users` | AdminUsersView | Gestión completa de usuarios (listar, editar, eliminar) |
| `/admin/orders` | AdminOrdersView | Gestión de pedidos con filtros y actualización de estados |

### Ruta de Desarrollo

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/test-services` | TestServicesView | Vista para probar servicios (desarrollo) |

### Características del Router

- **Navegación protegida**: Guard global verifica autenticación antes de cada ruta
- **Redirección automática**: Usuarios no autenticados van a `/login`, usuarios autenticados no pueden acceder a login/register
- **Protección por rol**: Rutas de admin solo accesibles para usuarios con `role: 'admin'`
- **Persistencia de sesión**: Token JWT almacenado en localStorage
- **Verificación automática**: Token verificado al cargar la aplicación

---

## 📊 Funcionalidades por Rol

### Usuario Normal

✅ Ver catálogo de productos  
✅ Agregar productos al carrito  
✅ Gestionar carrito (actualizar cantidades, eliminar items)  
✅ Realizar checkout con dirección de envío  
✅ Ver historial de pedidos propios  
✅ Ver detalles de cada pedido  
✅ Chat en tiempo real con otros usuarios  
❌ No puede crear/editar/eliminar productos  
❌ No puede ver todos los usuarios  
❌ No puede gestionar pedidos de otros usuarios  

### Administrador

✅ Todas las funcionalidades de usuario normal  
✅ **CRUD completo de productos**  
✅ **Gestión de usuarios** (listar, editar rol, eliminar)  
✅ **Gestión de pedidos** (ver todos, actualizar estados)  
✅ **Estadísticas de ventas** (total de pedidos, ingresos, estados)  
✅ Filtrado de pedidos por estado  
✅ Acceso al panel de administración  

---

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** 18.x - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Apollo Server** - Servidor GraphQL
- **Socket.IO** - WebSockets en tiempo real
- **JWT** - Autenticación con tokens
- **bcryptjs** - Hash de contraseñas
- **dotenv** - Variables de entorno

### Frontend
- **Vue 3** - Framework progresivo
- **Vite** - Build tool ultra-rápido
- **Pinia** - State management oficial de Vue
- **Vue Router** - Enrutamiento SPA
- **Axios** - Cliente HTTP
- **Apollo Client** - Cliente GraphQL
- **Socket.IO Client** - WebSockets cliente
- **CSS Variables** - Sistema de diseño modular

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación multi-contenedor
- **Nodemon** - Hot reload en desarrollo
- **Concurrently** - Ejecutar múltiples scripts

---

**¡Disfruta gestionando tu portal gaming!** ✨
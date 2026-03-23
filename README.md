# Products and Live Chat Portal

Aplicacion full-stack de e-commerce con chat en tiempo real, carrito y gestion de pedidos.

Stack actual:
- Backend: Node.js, Express, MongoDB (Mongoose), Apollo GraphQL, Socket.IO, JWT
- Frontend: Svelte 5 (runes) + Vite + `svelte-spa-router`

## Instalacion y Ejecucion

### Requisitos

- Node.js 18+
- npm 9+
- Docker + Docker Compose (opcional, recomendado)

### Opcion A: Docker (recomendada)

1. Entra a la carpeta del proyecto:

```bash
cd Products-and-live-chat-portal
```

2. Levanta servicios:

```bash
docker compose up --build
```

3. URLs:

- Frontend: `http://localhost:5173`
- Backend REST/GraphQL: `http://localhost:3000`
- GraphQL: `http://localhost:3000/graphql`
- Mongo desde host: `mongodb://localhost:27018/portal-productos`

Nota: entre contenedores la app usa `mongodb://mongodb:27017/portal-productos`.

### Opcion B: Local (sin Docker)

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env` en la raiz:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/portal-productos
JWT_SECRET=tu_clave_super_secreta
JWT_EXPIRES_IN=12h
ADMIN_CODE=admin1234
```

3. Inicia backend + frontend:

```bash
npm run dev
```

## Scripts

- `npm run dev`: backend + frontend en paralelo
- `npm run server`: backend (`src/server.js`)
- `npm run client`: frontend Vite
- `npm run build`: build de frontend
- `npm run preview`: preview de build

## Frontend Svelte 5 (Runes en uso)

La aplicacion usa runes de Svelte 5 en componentes/paginas reales.

### `$state`

`$state` se usa para declarar estado reactivo mutable dentro de componentes. Sirve para formularios, listas, flags de carga/error y estado de UI que cambia por interaccion del usuario o respuestas de API.

Usado para estado local/global en:
- `src/frontend/src/svelte/App.svelte`
- `src/frontend/src/svelte/components/AppNavBar.svelte`
- `src/frontend/src/svelte/state/appState.svelte.js`
- `src/frontend/src/svelte/pages/LoginPage.svelte`
- `src/frontend/src/svelte/pages/RegisterPage.svelte`
- `src/frontend/src/svelte/pages/ProductsPage.svelte`
- `src/frontend/src/svelte/pages/CartPage.svelte`
- `src/frontend/src/svelte/pages/CheckoutPage.svelte`
- `src/frontend/src/svelte/pages/MyOrdersPage.svelte`
- `src/frontend/src/svelte/pages/OrderDetailPage.svelte`
- `src/frontend/src/svelte/pages/AdminOrdersPage.svelte`
- `src/frontend/src/svelte/pages/AdminUsersPage.svelte`
- `src/frontend/src/svelte/pages/ChatPage.svelte`

### `$derived`

`$derived` se usa para calcular valores derivados a partir de otros estados, evitando duplicar logica. En este proyecto se usa para reglas de interfaz como mostrar u ocultar elementos segun la ruta actual.

Usado para estado derivado en:
- `src/frontend/src/svelte/App.svelte`

### `$effect`

`$effect` se usa para ejecutar efectos secundarios cuando cambia el estado reactivo, por ejemplo sincronizar errores de auth, lanzar validaciones o reaccionar a cambios que no son solo renderizado.

Usado para efectos reactivos en:
- `src/frontend/src/svelte/pages/LoginPage.svelte`
- `src/frontend/src/svelte/pages/RegisterPage.svelte`

### `$props`

`$props` se usa para leer props del componente de forma reactiva. En rutas dinamicas permite acceder a parametros como `id` de pedido sin depender de APIs legacy.

Usado para parametros de rutas dinamicas en:
- `src/frontend/src/svelte/pages/OrderDetailPage.svelte`

## Backend en Uso: Endpoints y Roles

Montaje principal en `src/server.js`:
- `/api/auth`
- `/api/products`
- `/api/chat`
- `/api/users`
- `/api/cart`
- `/api/orders`
- `/graphql`
- Socket.IO sobre el mismo servidor HTTP

### Roles

- `guest`: sin token
- `user`: autenticado con JWT
- `admin`: autenticado con JWT y rol admin

### Auth (`src/routes/authRoutes.js`)

- `POST /api/auth/register` -> `guest`
- `POST /api/auth/login` -> `guest`
- `GET /api/auth/verify` -> `user|admin`

### Products (`src/routes/productRoutes.js`)

- `GET /api/products` -> `guest|user|admin`
- `POST /api/products` -> `user|admin` (protegido por JWT)
- `PUT /api/products/:id` -> `user|admin` (protegido por JWT)
- `DELETE /api/products/:id` -> `user|admin` (protegido por JWT)

### Users (admin) (`src/routes/userRoutes.js`)

- `GET /api/users/stats` -> `admin`
- `GET /api/users` -> `admin`
- `GET /api/users/:id` -> `admin`
- `PUT /api/users/:id` -> `admin`
- `DELETE /api/users/:id` -> `admin`
- `PATCH /api/users/:id/toggle-status` -> `admin`

### Cart (`src/routes/cartRoutes.js`)

- `GET /api/cart` -> `user|admin`
- `POST /api/cart/items` -> `user|admin`
- `PUT /api/cart/items/:productId` -> `user|admin`
- `DELETE /api/cart/items/:productId` -> `user|admin`
- `DELETE /api/cart` -> `user|admin`

### Orders (`src/routes/orderRoutes.js`)

- `POST /api/orders` -> `user|admin`
- `GET /api/orders/my-orders` -> `user|admin`
- `GET /api/orders/:id` -> `owner|admin`
- `GET /api/orders` -> `admin`
- `PUT /api/orders/:id/status` -> `admin`

### Chat REST + Socket.IO (`src/routes/chatRoutes.js` y `src/server.js`)

- `GET /api/chat/messages` -> `user|admin`
- Eventos Socket.IO autenticados por JWT (`verifySocketJWT`)

### GraphQL (`src/graphql/typeDefs.js`, `src/graphql/resolvers/*`)

- Endpoint: `POST /graphql`
- Contexto con usuario extraido desde JWT
- Operaciones protegidas segun validaciones de resolvers

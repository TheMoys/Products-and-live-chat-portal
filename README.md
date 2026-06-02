# Products and Live Chat Portal

Aplicación full-stack de e-commerce con carrito y gestión de pedidos.

## Stack

- **Backend**: Python, FastAPI, MongoDB (PyMongo), Strawberry GraphQL, JWT
- **Frontend**: Svelte 5 (runes) + Vite + `svelte-spa-router`
- **Base de datos**: MongoDB

## Instalación y Ejecución

### Requisitos

- Python 3.9+
- Node.js 18+
- npm 9+
- Docker + Docker Compose (opcional, recomendado)

### Opción A: Docker (recomendada)

1. Entra a la carpeta del proyecto:

```bash
cd Products-and-live-chat-portal
```

2. Levanta los servicios:

```bash
docker compose up --build
```

3. URLs:

- Frontend: `http://localhost:5173`
- Backend REST/GraphQL: `http://localhost:3000`
- GraphQL: `http://localhost:3000/graphql`
- MongoDB desde host: `mongodb://localhost:27018/portal-productos`

Nota: Entre contenedores la app usa `mongodb://mongodb:27017/portal-productos`.

### Opción B: Local (sin Docker)

#### 1. Instala dependencias del backend (Python)

```bash
pip install -r requirements.txt
```

#### 2. Instala dependencias del frontend (Node.js)

```bash
npm install
```

#### 3. Crea `.env` en la raíz

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/portal-productos
JWT_SECRET=tu_clave_super_secreta
JWT_ALGORITHM=HS256
ADMIN_CODE=admin1234
```

#### 4. Inicia backend + frontend

```bash
# Terminal 1: Backend
uvicorn src.app.main:app --reload --port 3000

# Terminal 2: Frontend
npm run client
```

O usa ambos en paralelo con:

```bash
npm run dev
```

## Scripts

- `npm run dev`: Backend (uvicorn) + Frontend (Vite) en paralelo
- `npm run server`: Backend solo
- `npm run client`: Frontend Vite solo
- `npm run build`: Build de frontend
- `npm run preview`: Preview del build de frontend

## Frontend: Svelte 5 (Runes en uso)

La aplicación usa runes de Svelte 5 en componentes y páginas reales.

### `$state`

`$state` se usa para declarar estado reactivo mutable dentro de componentes. Sirve para formularios, listas, flags de carga/error y estado de UI que cambia por interacción del usuario o respuestas de API.

Usado en:
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

### `$derived`

`$derived` se usa para calcular valores derivados a partir de otros estados, evitando duplicar lógica. En este proyecto se usa para reglas de interfaz como mostrar u ocultar elementos según la ruta actual.

Usado en:
- `src/frontend/src/svelte/App.svelte`

### `$effect`

`$effect` se usa para ejecutar efectos secundarios cuando cambia el estado reactivo, por ejemplo sincronizar errores de auth, lanzar validaciones o reaccionar a cambios que no son solo renderizado.

Usado en:
- `src/frontend/src/svelte/pages/LoginPage.svelte`
- `src/frontend/src/svelte/pages/RegisterPage.svelte`

### `$props`

`$props` se usa para leer props del componente de forma reactiva. En rutas dinámicas permite acceder a parámetros como `id` de pedido sin depender de APIs legacy.

Usado en:
- `src/frontend/src/svelte/pages/OrderDetailPage.svelte`

## Backend: FastAPI - Endpoints y Roles

Montaje principal en `src/app/main.py`:
- `/api/auth`
- `/api/products`
- `/api/users`
- `/api/cart`
- `/api/orders`
- `/graphql`

### Roles

- `guest`: sin token
- `user`: autenticado con JWT
- `admin`: autenticado con JWT y rol admin

### Auth (`src/app/routers/auth.py`)

- `POST /api/auth/register` → `guest`
- `POST /api/auth/login` → `guest`
- `GET /api/auth/verify` → `user|admin`

### Products (`src/app/routers/products.py`)

- `GET /api/products` → `guest|user|admin`
- `POST /api/products` → `user|admin` (protegido por JWT)
- `PUT /api/products/:id` → `user|admin` (protegido por JWT)
- `DELETE /api/products/:id` → `user|admin` (protegido por JWT)

### Users (admin) (`src/app/routers/users.py`)

- `GET /api/users/stats` → `admin`
- `GET /api/users` → `admin`
- `GET /api/users/:id` → `admin`
- `PUT /api/users/:id` → `admin`
- `DELETE /api/users/:id` → `admin`
- `PATCH /api/users/:id/toggle-status` → `admin`

### Cart (`src/app/routers/cart.py`)

- `GET /api/cart` → `user|admin`
- `POST /api/cart/items` → `user|admin`
- `PUT /api/cart/items/:product_id` → `user|admin`
- `DELETE /api/cart/items/:product_id` → `user|admin`
- `DELETE /api/cart` → `user|admin`

### Orders (`src/app/routers/orders.py`)

- `POST /api/orders` → `user|admin`
- `GET /api/orders/my-orders` → `user|admin`
- `GET /api/orders/:id` → `owner|admin`
- `GET /api/orders` → `admin`
- `PUT /api/orders/:id/status` → `admin`

### GraphQL (`src/app/graphql/schema.py`, `src/app/graphql/resolvers/*`)

- Endpoint: `POST /graphql`
- Contexto con usuario extraído desde JWT
- Operaciones protegidas según validaciones de resolvers

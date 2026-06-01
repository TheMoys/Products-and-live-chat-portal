# Products and Live Chat Portal - Backend Python

## Descripción
Backend desarrollado en **Python con FastAPI** como reemplazo del backend original en Node.js. Mantiene exactamente la misma API y estructura JSON para asegurar compatibilidad con el frontend Svelte existente.

## Requisitos
- Python 3.11+
- MongoDB 7.0+
- Docker (opcional, para ejecutar en contenedores)

## Estructura del Proyecto

```
src/
├── app/
│   ├── main.py                 # Aplicación FastAPI
│   ├── config.py               # Configuración desde .env
│   ├── dependencies.py         # Inyección de dependencias (autenticación)
│   ├── models/
│   │   ├── user.py             # Modelo User para MongoDB
│   │   └── product.py          # Modelo Product para MongoDB
│   ├── schemas/
│   │   ├── user.py             # Validación Pydantic para User
│   │   └── product.py          # Validación Pydantic para Product
│   ├── repositories/
│   │   ├── user_repository.py  # Acceso a datos - Usuario
│   │   └── product_repository.py # Acceso a datos - Producto
│   ├── services/
│   │   ├── auth_service.py     # Lógica de autenticación
│   │   ├── user_service.py     # Lógica de usuarios
│   │   └── product_service.py  # Lógica de productos
│   ├── routers/
│   │   ├── auth.py             # Endpoints de autenticación
│   │   ├── users.py            # Endpoints de usuarios
│   │   └── products.py         # Endpoints de productos
│   └── security/
│       └── jwt.py              # Manejo de JWT y contraseñas
├── requirements.txt            # Dependencias Python
└── docker-compose.yml          # Orquestación de contenedores
```

## Instalación Local

### 1. Clonar y preparar el entorno
```bash
cd /home/diego.moys@ctdesarrollo-sdr.org/Escritorio/WEB/Products-and-live-chat-portal
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno
```bash
# .env debe estar en la raíz del proyecto
PORT=3000
MONGODB_URI=mongodb://localhost:27017/portal-productos
JWT_SECRET=tu_clave_super_secreta_cambiame
JWT_EXPIRES_IN=12h
ADMIN_CODE=admin1234
```

### 4. Ejecutar MongoDB localmente (con Docker)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### 5. Iniciar el servidor
```bash
python -m uvicorn src.app.main:app --reload --port 3000
```

El servidor estará disponible en: `http://localhost:3000`
Documentación interactiva: `http://localhost:3000/docs`

## Ejecución con Docker Compose

```bash
# Construir e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener
docker-compose down
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Login

### Productos
- `GET /api/products` - Obtener todos los productos (público)
- `POST /api/products` - Crear producto (autenticado)
- `PUT /api/products/{id}` - Actualizar producto (autenticado)
- `DELETE /api/products/{id}` - Eliminar producto (autenticado)

### Usuarios (admin)
- `GET /api/users` - Listar usuarios (admin)
- `GET /api/users/stats` - Estadísticas de usuarios (admin)
- `GET /api/users/{id}` - Obtener usuario (admin)
- `PUT /api/users/{id}` - Actualizar usuario (admin)
- `DELETE /api/users/{id}` - Eliminar usuario (admin)
- `PATCH /api/users/{id}/toggle-status` - Cambiar estado usuario (admin)

### Health Check
- `GET /health` - Verificar que el servidor está activo

## Estructura de Solicitudes y Respuestas

### Registro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario1",
    "email": "user@example.com",
    "password": "password123",
    "adminCode": "admin1234"  # opcional
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "usuario1",
    "email": "user@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

### Crear Producto
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Laptop",
    "price": 999.99,
    "description": "Laptop potente",
    "stock": 5,
    "imageUrl": "https://example.com/image.jpg"
  }'
```

## Diferencias con Node.js

### Seguridad
- **Hashing:** bcryptjs → passlib[bcrypt] (compatible)
- **JWT:** jsonwebtoken → python-jose (compatible)
- Mismos parámetros y tiempos de expiración

### Validación
- **Node.js:** Validación manual en cada endpoint
- **Python:** Validación automática con Pydantic en schemas

### Base de Datos
- **Node.js:** Mongoose ORM
- **Python:** PyMongo directo (más control, menos abstracción)

### Arquitectura
Ambas versiones siguen el mismo patrón de capas:
1. **Routers** - Controladores (endpoints HTTP)
2. **Services** - Lógica de negocio
3. **Repositories** - Acceso a datos
4. **Models** - Entidades de base de datos

## Documentación Interactiva (Swagger)

Accede a `http://localhost:3000/docs` para probar endpoints interactivamente.

## Logs de Desarrollo de IA

Ver `AI_DEVELOPMENT_LOG.md` para:
- Prompts utilizados
- Errores identificados y soluciones
- Análisis crítico de decisiones de la IA
- Comparativa Node.js vs Python

## Contacto y Soporte

Para reportar problemas o sugerencias, abrir un issue en el repositorio.

## Licencia

Proyecto educativo - Propuesta 2 de práctica profesional

# Guía de Configuración - Backend Python FastAPI

## Paso 1: Preparar el entorno

### En terminal, desde la raíz del proyecto:
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Actualizar pip
pip install --upgrade pip
```

## Paso 2: Instalar dependencias

```bash
# Instalar todos los paquetes requeridos
pip install -r requirements.txt
```

Este comando instala:
- **fastapi** - Framework web moderno
- **uvicorn** - Servidor ASGI
- **pymongo** - Driver de MongoDB
- **pydantic** - Validación de datos
- **python-jose** - Manejo de JWT
- **passlib** - Hashing de contraseñas
- **python-dotenv** - Variables de entorno

## Paso 3: Verificar MongoDB

### Opción A: Usando Docker (RECOMENDADO)
```bash
# Si Docker está instalado:
docker-compose up -d mongodb

# Verificar que está corriendo:
docker-compose logs mongodb
```

### Opción B: MongoDB local
Si tienes MongoDB instalado localmente:
```bash
# En macOS con Homebrew:
brew services start mongodb-community

# En Linux (systemd):
sudo systemctl start mongod

# Verificar conexión:
mongosh mongodb://localhost:27017
```

## Paso 4: Variables de entorno

El archivo `.env` ya existe con valores por defecto. Verificar que están correctos:

```bash
cat .env
```

Debe contener:
```
PORT=3000
MONGODB_URI=mongodb://uneat-mongodb:27017/portal-productos
JWT_SECRET=tu_clave_super_secreta_cambiame
JWT_EXPIRES_IN=12h
ADMIN_CODE=admin1234
```

**⚠️ Nota:** Para Docker Compose, `MONGODB_URI` debe ser `mongodb://uneat-mongodb:27017/...`
Para local, cambiar a: `mongodb://localhost:27017/...`

## Paso 5: Ejecutar el servidor

### Opción A: Con Docker Compose (TODO JUNTO)
```bash
# Desde la raíz del proyecto
docker-compose up

# En otra terminal, para ver logs:
docker-compose logs -f app
```

### Opción B: Localmente (desarrollo)
```bash
# Asegúrate que MongoDB está ejecutándose
# Actualiza .env con MONGODB_URI=mongodb://localhost:27017/portal-productos

# Ejecutar servidor con recarga automática:
python -m uvicorn src.app.main:app --reload --host 0.0.0.0 --port 3000
```

### Opción C: Producción
```bash
python -m uvicorn src.app.main:app --host 0.0.0.0 --port 3000
```

## Paso 6: Verificar que funciona

```bash
# Health check
curl http://localhost:3000/health

# Respuesta esperada:
# {
#   "status": "ok",
#   "timestamp": "2024-01-15T...",
#   "cors": "enabled"
# }
```

## Paso 7: Probar endpoints

### Registrar usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Obtener token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "password123"
  }'
```

Guardar el `token` de la respuesta.

### Crear producto
```bash
# Reemplazar TOKEN con el token obtenido arriba
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title": "Mi Producto",
    "price": 99.99,
    "stock": 10
  }'
```

## Paso 8: Interfaz Swagger (Documentación interactiva)

Abre en el navegador: `http://localhost:3000/docs`

Aquí puedes:
- Ver todos los endpoints disponibles
- Probar cada endpoint desde el navegador
- Ver la estructura de solicitudes y respuestas
- Autorizar con tu token JWT

## Solución de Problemas

### Error: "ModuleNotFoundError: No module named 'src'"
**Solución:** Ejecutar desde la raíz del proyecto con:
```bash
python -m uvicorn src.app.main:app --reload
```

### Error: "Connection refused" con MongoDB
**Solución:** Verificar que MongoDB está ejecutándose:
```bash
# Docker:
docker-compose ps

# Local:
mongosh mongodb://localhost:27017
```

### Error: "CORS error" desde frontend
**Verificar:** El endpoint está en la lista de allowed_origins en `src/app/main.py`

### Error: "Port 3000 already in use"
**Solución:** Cambiar puerto en .env o liberar el puerto:
```bash
# Ver qué proceso usa el puerto
lsof -i :3000

# O cambiar en .env:
PORT=3001
```

## Desarrollo

### Estructura recomendada de trabajo

1. **Cambios en modelos:** Editar `src/app/models/`
2. **Cambios en lógica:** Editar `src/app/services/`
3. **Cambios en acceso a datos:** Editar `src/app/repositories/`
4. **Nuevos endpoints:** Crear nuevo archivo en `src/app/routers/` e incluir en `main.py`
5. **Nuevas validaciones:** Editar `src/app/schemas/`

### Agregar nuevo endpoint
```python
# En src/app/routers/nuevo_router.py
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/nuevo", tags=["nuevo"])

@router.get("/")
async def mi_endpoint(user = Depends(get_current_user)):
    return {"message": "Hola"}

# En src/app/main.py, agregar:
from app.routers import nuevo_router
app.include_router(nuevo_router.router)
```

### Ejecutar con debug
```bash
# Con más verbosidad
python -m uvicorn src.app.main:app --reload --log-level debug

# Con pdb (debugger)
import pdb; pdb.set_trace()  # En tu código
```

## Próximos pasos

- [ ] Conectar frontend Svelte a `http://localhost:3000`
- [ ] Cambiar URL de API en variables de entorno del frontend
- [ ] Probar completamente la integración
- [ ] Documentar cambios en git

¡Backend listo para desarrollo! 🚀

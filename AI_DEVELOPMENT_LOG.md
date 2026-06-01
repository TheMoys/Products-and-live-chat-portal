# Backend Python con FastAPI - Documentación de IA

## Introducción
Este documento detalla el proceso de migración del backend de Node.js a Python usando FastAPI, incluyendo los prompts utilizados con IA y el análisis crítico de las respuestas.

## Estructura del Proyecto

```
src/
├── app/
│   ├── main.py              # Aplicación FastAPI principal
│   ├── config.py            # Configuración desde variables de entorno
│   ├── dependencies.py      # Dependencias de inyección (autenticación)
│   ├── models/              # Modelos de MongoDB
│   ├── schemas/             # Validación Pydantic de entrada/salida
│   ├── repositories/        # Patrón repositorio (acceso a datos)
│   ├── services/            # Lógica de negocio
│   ├── routers/             # Endpoints HTTP (controladores)
│   └── security/            # Manejo de JWT y contraseñas
└── requirements.txt         # Dependencias Python
```

## Prompts Utilizados y Evolución

### PROMPT 1: Estructura inicial del backend
**Objetivo:** Crear la estructura base del backend en FastAPI con autenticación JWT

**Prompt inicial (VERSIÓN 1):**
```
Crea un backend en FastAPI con la siguiente estructura:
- Autenticación JWT para usuarios
- CRUD de Productos
- CRUD de Usuarios (solo admin)
- Conexión a MongoDB
- Validación de entrada con Pydantic
- CORS configurado para localhost:5173

Usa arquitectura de capas: models, services, repositories, routers.
```

**Respuesta de IA:** ✅ Excelente
- Generó una estructura correcta con separación de responsabilidades
- Incluyó middlewares de CORS correctamente
- Propuso un patrón repositorio adecuado
- Los servicios estaban bien separados de los routers

**Refinamiento (VERSIÓN 2):**
```
Asegúrate que:
1. Los endpoints devuelvan exactamente la misma estructura JSON que Node.js
2. Los campos de error sean mensajes simples en español
3. El JWT use la misma configuración de Node.js (12 horas)
4. Las contraseñas se hasheen con bcrypt
5. Los usuarios admin se detecten con el código admin en registro
```

**Resultado:** ✅ Mejor
- Agregó validación de admin_code durante registro
- Mantuvo compatibilidad de estructura JSON
- Configuró JWT correctamente


### PROMPT 2: Manejo de conexión a MongoDB
**Objetivo:** Establecer la conexión a MongoDB sin usar un ORM

**Prompt inicial:**
```
Crea modelos de User y Product en Python que:
- Se conecten directamente a MongoDB sin ORM
- Conviertan ObjectId a string en JSON
- Implementen métodos find_by_id, find_all, etc.
- Hasheen contraseñas con bcrypt
```

**Respuesta de IA:** ⚠️ PARCIALMENTE CORRECTA
**Problemas encontrados:**
1. **Error:** La IA no mantuvo la consistencia entre la contraseña almacenada y la del formulario
   - **Causa:** El modelo User hasheaba la contraseña en `__init__`, lo que causaba que se hasheara dos veces
   - **Solución manual:** Separar lógica de hasheo en archivo `security/jwt.py` y aplicarla solo en ciertos casos
   
2. **Error:** No convertía correctamente ObjectId a string en ciertos casos
   - **Causa:** Falta de manejo en el método `to_dict()`
   - **Solución:** Agregar conversión explícita `str(self._id)` en todos los métodos

3. **Acierto:** La estructura de modelos con métodos estáticos fue correcta

**Código corregido:**
```python
# ❌ INCORRECTAMENTE GENERADO POR IA (doble hash):
user = User(username="test", email="test@test.com", password="123456")
# password ya está hasheado aquí

# ✅ CORRECCIÓN MANUAL APLICADA:
# Hashear SOLO en AuthService, no en User.__init__
```

---

### PROMPT 3: Validación de datos con Pydantic
**Objetivo:** Crear schemas para validación automática

**Prompt:**
```
Crea schemas Pydantic para:
- UserRegisterRequest (username, email, password, adminCode opcional)
- UserLoginRequest (emailOrUsername, password)
- UserResponse (sin contraseña)
- ProductCreate y ProductUpdate
- Validación de campos requeridos
- Manejo de alias para camelCase a snake_case
```

**Respuesta de IA:** ✅ EXCELENTE
- Utilizó `Field` y `EmailStr` correctamente
- Implementó aliases para convertir camelCase ↔ snake_case
- Validaciones de rango (min_length, gt=0) correctas
- Pydantic.ConfigDict correcto

**Acierto especial:** La IA automáticamente supo usar `populate_by_name=True` para aceptar ambos formatos

---

### PROMPT 4: Dependencias de autenticación en FastAPI
**Objetivo:** Crear sistema de inyección de dependencias para proteger rutas

**Prompt:**
```
Crea dependencias FastAPI para:
1. get_current_user - Valida JWT y retorna usuario autenticado
2. get_current_admin_user - Valida que sea admin
3. Usa HTTPBearer para leer token de Authorization header
4. Retorna HTTPException(401) si token inválido
5. Retorna HTTPException(403) si no es admin
```

**Respuesta de IA:** ✅ CORRECTO
```python
# Exactamente lo que necesitábamos
async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    token = credentials.credentials
    # ... validación
    return user
```

---

### PROMPT 5: Endpoints y routers
**Objetivo:** Generar los endpoints HTTP compatibles con Node.js

**Prompt inicial (VERSIÓN 1):**
```
Crea routers para:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/users (admin)
- GET /api/users/:id (admin)
- PUT /api/users/:id (admin)
- DELETE /api/users/:id (admin)
- GET /api/products (público)
- POST /api/products (autenticado)
- PUT /api/products/:id (autenticado)
- DELETE /api/products/:id (autenticado)

Respuestas deben ser idénticas a Node.js
```

**Respuesta de IA:** ⚠️ NECESITÓ CORRECCIÓN
**Problema:** 
- Los endpoints retornaban estructuras ligeramente diferentes
- Faltaba el endpoint `GET /api/users/stats` (admin)
- Faltaba `PATCH /api/users/:id/toggle-status`

**Corrección manual:**
1. Agregué GET `/api/users/stats` antes de GET `/:id` (orden importa en FastAPI)
2. Agregué PATCH `/api/users/{user_id}/toggle-status`
3. Ajusté nombres de respuestas para que coincidan exactamente

---

## Análisis Crítico: Errores y Soluciones

### ERROR 1: Doble Hashing de Contraseñas ⚠️

**Descripción del error:**
La IA generó código que hasheaba la contraseña dos veces:
1. Una vez cuando se creaba la instancia de User
2. Otra vez cuando se guardaba en BD

**Código problemático:**
```python
# ❌ INCORRECTO
class User:
    def __init__(self, password):
        self.password = PasswordHandler.hash_password(password)  # PRIMER HASH
    
    def save(self):
        self.collection.insert_one({
            'password': PasswordHandler.hash_password(self.password)  # SEGUNDO HASH ❌
        })
```

**Por qué fue un error:**
- Causes que las contraseñas se hasheen incorrectamente
- Al hacer login, la comparación fallaba
- Error 500 en todos los intentos de login

**Solución manual:**
```python
# ✅ CORRECTO
class User:
    def __init__(self, password):
        self.password = password  # GUARDAR SIN HASHEAR (todavía)
    
# En AuthService:
def register(username, email, password):
    user = User(username, email, password)  # Sin hashear aún
    hashed_pass = PasswordHandler.hash_password(password)
    user.password = hashed_pass
    user.save()  # Guardar ya hasheado
```

**Lección aprendida:** 
La separación de responsabilidades es crucial. El hashing debe ocurrir en una única capa (SecurityService), no repartido entre Model y Repository.

---

### ERROR 2: Falta de Conversión ObjectId → String ⚠️

**Descripción:**
MongoDB retorna ObjectId, pero el frontend espera strings. La IA no siempre convertía.

**Código problemático:**
```python
# ❌ INCORRECTO
def find_by_id(cls, user_id):
    doc = cls.collection.find_one({'_id': ObjectId(user_id)})
    return doc  # Retorna con ObjectId, no string
```

**Error resultante:**
```json
{
  "_id": ObjectId("..."),  // ❌ No es JSON válido
  "username": "test"
}
```

**Solución:**
```python
# ✅ CORRECTO
def to_dict(self):
    return {
        '_id': str(self._id),  # Convertir aquí
        'username': self.username,
        ...
    }
```

**Lección:**
Las conversiones de tipo deben ocurrir en la serialización (to_dict), no en la recuperación.

---

### ERROR 3: Orden de rutas en FastAPI 🔴

**Descripción:**
La IA creó `GET /api/users/:id` antes de `GET /api/users/stats`.
FastAPI interpreta `:id` como parámetro y `stats` se intenta tratar como ID.

**Código problemático:**
```python
# ❌ INCORRECTO - ORDEN
@router.get("/{user_id}")        # FastAPI matchea ANY string como user_id
def get_user(user_id: str):...

@router.get("/stats")            # NUNCA se alcanza porque "stats" matchea {user_id}
def get_stats():...
```

**Solución:**
```python
# ✅ CORRECTO - ORDEN
@router.get("/stats")            # Específico primero
def get_stats():...

@router.get("/{user_id}")        # Genérico después
def get_user(user_id: str):...
```

**Lección:**
En FastAPI, las rutas más específicas deben declararse antes que las genéricas.

---

### ERROR 4: Validación de Email Duplicado 🔴

**Descripción:**
La IA no validaba emails duplicados al actualizar usuarios.

**Código original (incompleto):**
```python
# ❌ INCORRECTO
@router.put("/{user_id}")
def update_user(user_id, request):
    user = get_user(user_id)  # ¿Qué pasa si el email ya existe?
```

**Solución manual:**
```python
# ✅ CORRECTO
if 'email' in update_data:
    existing = UserRepository.get_by_email(update_data['email'])
    if existing and str(existing._id) != user_id:
        raise ValueError("Email already exists")
```

---

## Comparativa: Node.js vs Python

| Aspecto | Node.js | Python |
|---------|---------|--------|
| Hashing | bcryptjs | passlib[bcrypt] |
| JWT | jsonwebtoken | python-jose |
| Validación | Manual | Pydantic (automática) |
| BD | Mongoose | pymongo directo |
| Respuestas | Manuales | Schemas Pydantic |

---

## Conclusión

### ¿Fue útil la IA?
**Sí, pero requirió supervisión.**

La IA fue excelente en:
- ✅ Generar estructura de proyecto
- ✅ Boilerplate de autenticación
- ✅ Validación con Pydantic
- ✅ Configuración de CORS

La IA tuvo dificultades en:
- ⚠️ Separación de responsabilidades en casos complejos
- ⚠️ Orden de rutas en FastAPI
- ⚠️ Manejo de tipos de MongoDB

### Valor agregado manual:
1. Separación clara de hashing en capa de seguridad
2. Conversiones ObjectId → String centralizadas
3. Validación de duplicados en actualizaciones
4. Orden correcto de rutas
5. Documentación coherente

**Tiempo ahorrado con IA:** ~5 horas
**Tiempo corrigiendo errores:** ~1 hora
**Ratio beneficio:** 5:1 favorable a IA


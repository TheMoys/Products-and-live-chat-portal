# 📋 TODO - Portal de Productos y Chat

**Última actualización:** 12 de enero de 2026  
**Estado del proyecto:** 🟡 En desarrollo (80% completado)

---

## 📊 Resumen General

### ✅ Completado
- Backend completo (REST API + GraphQL + Socket.IO)
- Modelos de datos (Users, Products, Cart, Order, Message)
- Frontend: Services y Stores Pinia
- Frontend: CartView.vue con estilos

### ⏳ En Progreso
- Vistas de usuario (checkout, pedidos)

### ❌ Pendiente
- Vistas de administración
- Componentes reutilizables
- Mejoras en ProductsView

---

## 🎯 PRIORIDAD ALTA - Vistas de Usuario

### 1. CheckoutView.vue ⭐ URGENTE
**Estado:** ❌ NO IMPLEMENTADO  
**Ubicación:** `src/frontend/src/views/CheckoutView.vue`  
**CSS:** `src/frontend/src/assets/styles/checkout.css`  

**Funcionalidad requerida:**
- [ ] Formulario de dirección de envío (street, city, state, zipCode, country)
- [ ] Resumen del carrito (productos y total)
- [ ] Validación de formulario
- [ ] Botón "Confirmar Pedido" que llama a `orderStore.createOrder()`
- [ ] Mostrar loading durante la creación
- [ ] Redirección a "Mis Pedidos" al completar
- [ ] Manejo de errores (stock insuficiente, carrito vacío)

**Ruta a agregar en router:**
```javascript
{
  path: '/checkout',
  name: 'checkout',
  component: () => import('@/views/CheckoutView.vue'),
  meta: { requiresAuth: true }
}
```

---

### 2. MyOrdersView.vue
**Estado:** ❌ NO IMPLEMENTADO  
**Ubicación:** `src/frontend/src/views/MyOrdersView.vue`  
**CSS:** `src/frontend/src/assets/styles/orders.css`  

**Funcionalidad requerida:**
- [ ] Listar todos los pedidos del usuario (`orderStore.fetchMyOrders()`)
- [ ] Mostrar: orderNumber, fecha, total, estado
- [ ] Tarjetas de pedido con colores según estado:
  - 🟡 Pending (amarillo)
  - 🔵 Processing (azul)
  - 🟢 Shipped (verde claro)
  - ✅ Delivered (verde oscuro)
  - ❌ Cancelled (rojo)
- [ ] Click en pedido → ir a OrderDetailView
- [ ] Filtro por estado (dropdown)
- [ ] Mensaje "No tienes pedidos" si está vacío
- [ ] Loading state
- [ ] Error handling

**Ruta a agregar en router:**
```javascript
{
  path: '/my-orders',
  name: 'my-orders',
  component: () => import('@/views/MyOrdersView.vue'),
  meta: { requiresAuth: true }
}
```

---

### 3. OrderDetailView.vue
**Estado:** ❌ NO IMPLEMENTADO  
**Ubicación:** `src/frontend/src/views/OrderDetailView.vue`  
**CSS:** Usar `orders.css` existente  

**Funcionalidad requerida:**
- [ ] Recibir orderId desde route params
- [ ] Llamar a `orderStore.fetchOrderDetail(orderId)`
- [ ] Mostrar información completa:
  - Número de orden
  - Fecha de creación
  - Estado actual con badge colorido
  - Lista de productos (imagen, nombre, cantidad, precio)
  - Dirección de envío completa
  - Total del pedido
- [ ] Botón "Volver a Mis Pedidos"
- [ ] Timeline de estados (opcional pero bonito)
- [ ] Loading y error states

**Ruta a agregar en router:**
```javascript
{
  path: '/orders/:id',
  name: 'order-detail',
  component: () => import('@/views/OrderDetailView.vue'),
  meta: { requiresAuth: true }
}
```

---

## 🔐 PRIORIDAD MEDIA - Vistas de Administración

### 4. AdminDashboard.vue
**Estado:** ❌ NO IMPLEMENTADO  
**Ubicación:** `src/frontend/src/views/AdminDashboard.vue`  
**CSS:** `src/frontend/src/assets/styles/admin.css`  

**Funcionalidad requerida:**
- [ ] Panel de inicio para administradores
- [ ] Tarjetas con estadísticas:
  - Total de usuarios (regular vs admin)
  - Total de productos
  - Total de pedidos
  - Pedidos pendientes
  - Ingresos totales (suma de pedidos completados)
- [ ] Navegación rápida a:
  - Gestión de Usuarios
  - Gestión de Pedidos
  - Gestión de Productos (existente)
- [ ] Gráficos (opcional): pedidos por mes, productos más vendidos

**Ruta a agregar en router:**
```javascript
{
  path: '/admin',
  name: 'admin-dashboard',
  component: () => import('@/views/AdminDashboard.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

---

### 5. AdminUsersView.vue
**Estado:** ❌ NO IMPLEMENTADO  
**Ubicación:** `src/frontend/src/views/AdminUsersView.vue`  
**CSS:** Usar `admin.css`  

**Funcionalidad requerida:**
- [ ] Tabla de usuarios con columnas:
  - Username
  - Email
  - Rol (badge colorido)
  - Fecha de registro
  - Acciones
- [ ] Llamar a `usersStore.fetchAllUsers()` al montar
- [ ] Botón "Cambiar Rol" por usuario
  - Toggle entre 'user' y 'admin'
  - Confirmación antes de cambiar
  - No permitir cambiar el propio rol
- [ ] Botón "Eliminar Usuario"
  - Confirmación con alerta
  - No permitir eliminarse a sí mismo
- [ ] Búsqueda de usuarios (por username o email)
- [ ] Filtro por rol (todos, admins, usuarios)
- [ ] Loading y error states

**Ruta a agregar en router:**
```javascript
{
  path: '/admin/users',
  name: 'admin-users',
  component: () => import('@/views/AdminUsersView.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

---

### 6. AdminOrdersView.vue
**Estado:** ❌ NO IMPLEMENTADO  
**Ubicación:** `src/frontend/src/views/AdminOrdersView.vue`  
**CSS:** Usar `admin.css` y `orders.css`  

**Funcionalidad requerida:**
- [ ] Listar TODOS los pedidos (`orderStore.fetchAllOrders()`)
- [ ] Tabla/Tarjetas con información:
  - Número de orden
  - Usuario que compró (username)
  - Fecha
  - Total
  - Estado actual
  - Acciones
- [ ] Filtros:
  - Por estado (pending, processing, shipped, delivered, cancelled)
  - Por fecha (últimos 7 días, último mes, etc.)
- [ ] Dropdown para cambiar estado del pedido
  - Llamar a `orderStore.updateOrderStatus(orderId, newStatus)`
  - Confirmación antes de cambiar
- [ ] Click en pedido → ver detalle (OrderDetailView)
- [ ] Exportar pedidos a CSV (opcional)
- [ ] Loading y error states

**Ruta a agregar en router:**
```javascript
{
  path: '/admin/orders',
  name: 'admin-orders',
  component: () => import('@/views/AdminOrdersView.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

---

## 🧩 PRIORIDAD BAJA - Componentes Reutilizables

### 7. CartItem.vue
**Estado:** ❌ NO IMPLEMENTADO  
**Ubicación:** `src/frontend/src/components/CartItem.vue`  

**Props:**
- `item` (Object): { product, quantity, price }

**Emisiones:**
- `update-quantity(productId, newQuantity)`
- `remove(productId)`

**Funcionalidad:**
- Mostrar imagen, título, descripción, stock
- Controles de cantidad (+/-)
- Botón eliminar
- Precio unitario y total

**Ventaja:** Simplificar CartView.vue extrayendo lógica repetitiva

---

### 8. OrderCard.vue
**Estado:** ❌ NO IMPLEMENTADO  
**Ubicación:** `src/frontend/src/components/OrderCard.vue`  

**Props:**
- `order` (Object): pedido completo

**Emisiones:**
- `click` (para ir a detalle)

**Funcionalidad:**
- Tarjeta compacta con info del pedido
- Badge de estado colorido
- Fecha formateada
- Total
- Hover effect

**Ventaja:** Reutilizar en MyOrdersView y AdminOrdersView

---

### 9. ProductCard.vue (MEJORAR)
**Estado:** ⚠️ EXISTE PERO INCOMPLETO  
**Ubicación:** `src/frontend/src/components/ProductCard.vue` (si existe)  
**Alternativa:** Mejorar ProductsView.vue directamente  

**Mejoras requeridas:**
- [ ] Botón "Añadir al Carrito" en cada producto
- [ ] Click llama a `cartStore.addItem(productId, 1)`
- [ ] Mostrar feedback visual:
  - Loading durante la acción
  - Mensaje "✅ Agregado al carrito"
  - Animación de botón
- [ ] Deshabilitar si no hay stock
- [ ] Mostrar cantidad en carrito si ya está agregado

---

### 10. StatusBadge.vue
**Estado:** ❌ NO IMPLEMENTADO  
**Ubicación:** `src/frontend/src/components/StatusBadge.vue`  

**Props:**
- `status` (String): estado del pedido

**Funcionalidad:**
- Componente simple para mostrar badges de estado con colores
- Reutilizable en todas las vistas de pedidos

---

## 🎨 CSS Pendiente

### checkout.css
**Ubicación:** `src/frontend/src/assets/styles/checkout.css`

**Estilos necesarios:**
- Formulario de 2 columnas (desktop) / 1 columna (mobile)
- Inputs con validación visual (verde/rojo)
- Resumen del pedido sticky sidebar
- Botón de confirmación destacado
- Loading overlay
- Responsive design

---

### orders.css
**Ubicación:** `src/frontend/src/assets/styles/orders.css`

**Estilos necesarios:**
- Tarjetas de pedido con gradientes según estado
- Timeline de estados (opcional)
- Tabla responsive para admin
- Filtros estilizados
- Badges de estado con colores específicos:
  - Pending: #f39c12 (naranja)
  - Processing: #3498db (azul)
  - Shipped: #2ecc71 (verde claro)
  - Delivered: #27ae60 (verde oscuro)
  - Cancelled: #e74c3c (rojo)

---

### admin.css
**Ubicación:** `src/frontend/src/assets/styles/admin.css`

**Estilos necesarios:**
- Dashboard con grid de tarjetas estadísticas
- Tablas de datos con hover effects
- Botones de acción (cambiar rol, eliminar)
- Filtros y búsqueda estilizados
- Sidebar de navegación admin (opcional)
- Colores institucionales para admin
- Dark mode opcional

---

## 🔄 Router - Actualizaciones Pendientes

### Agregar middleware requiresAdmin

**Ubicación:** `src/frontend/src/router/index.js`

```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      const isValid = await authStore.checkAuth()
      if (!isValid) {
        return next('/login')
      }
    }
    
    // ⭐ AGREGAR VALIDACIÓN DE ADMIN
    if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
      return next('/') // Redirigir a home si no es admin
    }
    
    next()
  }
  else if (to.meta.guest) {
    if (authStore.isAuthenticated) {
      return next('/')
    }
    next()
  }
  else {
    next()
  }
})
```

---

## 🏠 HomeView - Mejoras Opcionales

**Ubicación:** `src/frontend/src/views/HomeView.vue`

### Mejoras sugeridas:
- [ ] Mostrar tarjetas de navegación con iconos grandes
- [ ] Para usuarios normales:
  - 🛍️ Ver Productos
  - 🛒 Mi Carrito (con badge de cantidad)
  - 📦 Mis Pedidos
  - 💬 Chat
- [ ] Para administradores (adicionales):
  - 👑 Panel Admin
  - 👥 Gestión de Usuarios
  - 📦 Gestión de Pedidos
  - 📊 Estadísticas
- [ ] Mostrar nombre del usuario: "Bienvenido, [username]"
- [ ] Botón de logout visible

---

## 📱 Responsive Design

### Puntos de quiebre recomendados:
```css
/* Mobile */
@media (max-width: 576px) { ... }

/* Tablet */
@media (max-width: 768px) { ... }

/* Desktop pequeño */
@media (max-width: 992px) { ... }

/* Desktop grande */
@media (min-width: 1200px) { ... }
```

### Vistas que requieren responsive:
- [x] CartView.vue
- [ ] CheckoutView.vue
- [ ] MyOrdersView.vue
- [ ] OrderDetailView.vue
- [ ] AdminUsersView.vue
- [ ] AdminOrdersView.vue

---

## 🧪 Testing (Opcional pero Recomendado)

### Pruebas unitarias
- [ ] Tests para stores Pinia
- [ ] Tests para services
- [ ] Tests para componentes

### Pruebas E2E
- [ ] Flujo completo de compra
- [ ] Gestión de usuarios admin
- [ ] Gestión de pedidos admin

---

## 🚀 Mejoras Futuras (No Urgentes)

### Funcionalidades adicionales:
- [ ] Notificaciones push cuando cambia estado de pedido
- [ ] Sistema de reviews/calificaciones de productos
- [ ] Wishlist / Lista de deseos
- [ ] Comparar productos
- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] Multi-idioma (i18n)
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Paginación en listados de productos y pedidos
- [ ] Integración con pasarela de pago real (Stripe, PayPal)
- [ ] Envío de emails (confirmación de pedido, cambio de estado)
- [ ] Panel de métricas/analytics para admin
- [ ] Gestión de categorías de productos (CRUD)
- [ ] Subida de imágenes de productos (Cloudinary, S3)

---

## 📋 Checklist de Implementación

### FASE 3: Vistas de Usuario (ACTUAL)
- [x] CartView.vue
- [ ] CheckoutView.vue ⏳ SIGUIENTE
- [ ] MyOrdersView.vue
- [ ] OrderDetailView.vue

### FASE 4: Vistas de Admin
- [ ] AdminDashboard.vue
- [ ] AdminUsersView.vue
- [ ] AdminOrdersView.vue

### FASE 5: Componentes
- [ ] CartItem.vue
- [ ] OrderCard.vue
- [ ] StatusBadge.vue
- [ ] Mejorar ProductCard.vue

### FASE 6: Estilos
- [x] cart.css
- [ ] checkout.css
- [ ] orders.css
- [ ] admin.css

### FASE 7: Router
- [ ] Middleware requiresAdmin
- [ ] Todas las rutas agregadas

### FASE 8: Pulido
- [ ] Responsive en todas las vistas
- [ ] Error handling consistente
- [ ] Loading states en todas las vistas
- [ ] Confirmaciones en acciones destructivas
- [ ] Feedback visual en todas las acciones

---

## 🐛 Bugs Conocidos

- Ninguno hasta el momento ✅

---

## 📝 Notas Importantes

1. **Orden de implementación recomendado:**
   - CheckoutView → MyOrdersView → OrderDetailView
   - AdminDashboard → AdminUsersView → AdminOrdersView
   - Componentes reutilizables al final

2. **Validaciones importantes:**
   - No permitir checkout con carrito vacío
   - Verificar stock antes de crear pedido
   - No permitir admin eliminarse a sí mismo
   - No permitir admin cambiar su propio rol

3. **Seguridad:**
   - Todas las rutas admin deben validar rol
   - JWT debe verificarse en cada request
   - No exponer información sensible en frontend

4. **UX/UI:**
   - Loading states en todas las operaciones async
   - Mensajes de error claros y amigables
   - Confirmaciones en acciones destructivas
   - Feedback visual inmediato

---

## 🎯 Próxima Sesión

**Continuar con:** CheckoutView.vue + checkout.css

**Código de sesión:** `CART-VIEW-COMPLETED-2026-01-12`

---

**Proyecto:** Portal de Productos y Chat  
**Tecnologías:** Vue 3 + Node.js + Express + MongoDB + GraphQL + Socket.IO  
**Estado:** 🟡 80% completado  
**Última actualización:** 12 de enero de 2026

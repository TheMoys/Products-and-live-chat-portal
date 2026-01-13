import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/HomeView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue'),
            meta: { guest: true }
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('@/views/RegisterView.vue'),
            meta: { guest: true }
        },
        {
            path: '/products',
            name: 'products',
            component: () => import('@/views/ProductsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import('@/views/ChatView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/test-services',
            name: 'TestServices',
            component: () => import('@/views/TestServicesView.vue'),
            meta: { requiresAuth: true } // Requiere autenticación
        },
        {
            path: '/cart',
            name: 'cart',
            component: () => import('@/views/CartView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/checkout',
            name: 'checkout',
            component: () => import('@/views/CheckoutView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/my-orders',
            name: 'my-orders',
            component: () => import('@/views/MyOrdersView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/orders/:id',
            name: 'order-detail',
            component: () => import('@/views/OrderDetailView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/orders',
            name: 'admin-orders',
            component: () => import('@/views/AdminOrdersView.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
    ]
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const token = localStorage.getItem('token')
    
    // Si requiere autenticación
    if (to.meta.requiresAuth && !token) {
        return next('/login')
    }
    
    // Si requiere admin
    if (to.meta.requiresAdmin) {
        if (!authStore.isAdmin) {
            alert('⛔ Acceso denegado - Solo administradores')
            return next('/')
        }
    }
    
    // Si ya está autenticado y va a login/register
    if (to.meta.guest && token) {
        return next('/')
    }
    
    next()
})

export default router
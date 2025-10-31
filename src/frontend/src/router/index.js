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
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth) {

        if (!authStore.isAuthenticated) {
            const isValid = await authStore.checkAuth()

            if (!isValid) {
                next('/login')
                return
            }
        }
        next()
    }

    else if (to.meta.guest) {
        if (authStore.isAuthenticated) {
            next('/')
            return
        }
        next()
    }
    else {
        next()
    }
})

export default router
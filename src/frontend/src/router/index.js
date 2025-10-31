import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/HomeView.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('@/views/RegisterView.vue')
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


router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else if ((to.name === 'login' || to.name === 'register') && token) {
        next('/')
    } else {
        next()
    }
})

export default router
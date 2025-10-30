<!-- filepath: src/frontend/src/views/HomeView.vue -->
<template>
    <div class="home-container">
        <nav class="navbar">
            <div class="navbar-brand">
                <h1>UNEAT</h1>
            </div>
            <div class="user-info">
                <div class="user-badge">
                    <div>
                        <div class="username">{{ authStore.user?.username }}</div>
                        <div class="role">{{ authStore.user?.role }}</div>
                    </div>
                </div>
                <button @click="handleLogout" class="btn-logout">
                    Cerrar Sesión
                </button>
            </div>
        </nav>

        <div class="home-content">
            <section class="welcome-section">
                <h2>Bienvenido, {{ authStore.user?.username }}!</h2>
                <p>Portal de gestión gaming UNEAT</p>
            </section>

            <div class="navigation-grid">
                <div class="nav-card" @click="goTo('/products')">
                    <div class="nav-card-icon">🎮</div>
                    <h3>Productos</h3>
                    <p>Explora nuestro catálogo de videojuegos</p>
                    <span v-if="authStore.isAdmin" class="admin-badge">Gestión Admin</span>
                </div>

                <div class="nav-card" @click="goTo('/chat')">
                    <div class="nav-card-icon">💬</div>
                    <h3>Chat</h3>
                    <p>Comunícate con otros jugadores</p>
                </div>

                <div class="nav-card" v-if="authStore.isAdmin">
                    <div class="nav-card-icon">⚙️</div>
                    <h3>Administración</h3>
                    <p>Panel de control admin</p>
                    <span class="admin-badge">Solo Admin</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import '@/assets/styles/home.css'

const router = useRouter()
const authStore = useAuthStore()

function goTo(path) {
    router.push(path)
}

function handleLogout() {
    authStore.logout()
    router.push('/login')
}
</script>
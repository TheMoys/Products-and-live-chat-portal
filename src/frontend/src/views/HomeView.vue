<template>
    <div class="home-container">
        <nav class="navbar">
            <div class="navbar-brand">
                <h1>Arcane Archives</h1>
            </div>
            
            <!-- Navegación principal -->
            <div class="navbar-links">
                
                <router-link v-if="!authStore.isAdmin" to="/cart" class="btn btn-secondary">
                    🛒 Carrito
                </router-link>
                
                <router-link to="/my-orders" class="btn btn-secondary">
                    📦 Mis Pedidos
                </router-link>
                
                <template v-if="authStore.isAdmin">
                    <router-link to="/admin/orders" class="btn btn-secondary">
                        🛠️ Gestión Pedidos
                    </router-link>

                    <router-link to="/admin/users" class="btn btn-secondary">
                        👥 Gestión Usuarios
                    </router-link>
                </template>
            </div>
            
            <!-- Usuario y logout a la derecha -->
            <div class="user-section">
                <div class="user-info">
                    <div class="username">{{ authStore.user?.username }}</div>
                    <div class="role">{{ authStore.user?.role }}</div>
                </div>
                <button @click="handleLogout" class="btn btn-danger btn-small">
                    Cerrar Sesión
                </button>
            </div>
        </nav>

        <div class="home-content">
            <section class="welcome-section">
                <h2>Bienvenido, {{ authStore.user?.username }}!</h2>
                <p>Portal de gestión gaming</p>
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
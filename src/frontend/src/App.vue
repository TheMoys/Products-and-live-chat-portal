<!-- filepath: src/frontend/src/App.vue -->
<template>
    <div id="app" class="gaming-app">
        <div v-if="loading" class="app-loading">
            <div class="loading-spinner"></div>
            <p>Cargando...</p>
        </div>
        <RouterView v-else />
    </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(true)

onMounted(async () => {
    // Verificar sesión al cargar la app
    await authStore.checkAuth()
    loading.value = false
})
</script>

<style>
.gaming-app {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

/* Loading inicial de la app */
.app-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: var(--text-secondary);
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(0, 243, 255, 0.1);
    border-top-color: var(--neon-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
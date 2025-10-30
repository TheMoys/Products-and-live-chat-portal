<!-- filepath: src/frontend/src/views/LoginView.vue -->
<template>
    <div class="auth-container">
        <div class="auth-card">
            <div class="logo-section">
                <h1 class="glitch">UNEAT</h1>
                <p class="subtitle">GAMING PORTAL</p>
            </div>

            <form @submit.prevent="handleLogin" class="auth-form">
                <div class="input-group">
                    <label for="emailOrUsername">Usuario o Email</label>
                    <input type="text" id="emailOrUsername" v-model="form.emailOrUsername"
                        placeholder="Ingresa tu usuario o email" required />
                </div>

                <div class="input-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" v-model="form.password" placeholder="Ingresa tu contraseña"
                        required />
                </div>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="!loading">INICIAR SESIÓN</span>
                    <span v-else class="loader"></span>
                </button>
            </form>

            <div class="switch-auth">
                ¿No tienes cuenta?
                <router-link to="/register">Regístrate aquí</router-link>
            </div>
        </div>

        <div class="particles"></div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import '@/assets/styles/auth.css'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
    emailOrUsername: '',
    password: ''
})

const loading = ref(false)
const error = ref(null)

async function handleLogin() {
    loading.value = true
    error.value = null

    try {
        await authStore.login({
            emailOrUsername: form.value.emailOrUsername,
            password: form.value.password
        })
        router.push('/')
    } catch (err) {
        error.value = err.message || 'Error al iniciar sesión'
    } finally {
        loading.value = false
    }
}
</script>
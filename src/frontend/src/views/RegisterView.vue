<!-- filepath: src/frontend/src/views/RegisterView.vue -->
<template>
    <div class="auth-container">
        <div class="auth-card">
            <div class="logo-section">
                <h1 class="glitch">UNIRSE</h1>
                <p class="subtitle">CREAR CUENTA</p>
            </div>

            <form @submit.prevent="handleRegister" class="auth-form">
                <div class="input-group">
                    <label for="username">Usuario</label>
                    <input type="text" id="username" v-model="form.username" placeholder="Elige tu nombre de usuario"
                        required />
                </div>

                <div class="input-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" v-model="form.email" placeholder="tu@email.com" required />
                </div>

                <div class="input-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" v-model="form.password" placeholder="Mínimo 6 caracteres"
                        required />
                </div>

                <div class="input-group">
                    <label for="adminCode">Código de Administrador (Opcional)</label>
                    <input type="password" id="adminCode" v-model="form.adminCode"
                        placeholder="Déjalo vacío para cuenta de usuario" autocomplete="off" />
                    <small class="input-hint">
                        💡 Si tienes un código de administrador, ingrésalo aquí
                    </small>
                </div>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="!loading">REGISTRARSE</span>
                    <span v-else class="loader"></span>
                </button>
            </form>

            <div class="switch-auth">
                ¿Ya tienes cuenta?
                <router-link to="/login">Inicia sesión</router-link>
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
    username: '',
    email: '',
    password: '',
    adminCode: ''
})

const loading = ref(false)
const error = ref(null)

async function handleRegister() {
    loading.value = true
    error.value = null

    try {
        await authStore.register(
            form.value.username,
            form.value.email,
            form.value.password,
            form.value.adminCode
        )
        router.push('/')
    } catch (err) {
        error.value = err.message || 'Error al registrarse'
    } finally {
        loading.value = false
    }
}
</script>
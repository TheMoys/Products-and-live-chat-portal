import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/services/axios'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(null)
    const loading = ref(false)

    const isAuthenticated = computed(() => !!token.value && !!user.value)
    const isAdmin = computed(() => user.value?.role === 'admin')

    function setAuth(userData, userToken) {
        user.value = userData
        token.value = userToken
        localStorage.setItem('token', userToken)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    function clearAuth() {
        user.value = null
        token.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    async function checkAuth() {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (!storedToken || !storedUser) {
            clearAuth()
            return false
        }

        try {

            token.value = storedToken
            user.value = JSON.parse(storedUser)


            const response = await axios.get('/auth/verify')

            if (response.data.valid) {
                return true
            } else {
                clearAuth()
                return false
            }
        } catch (error) {
            console.error('Token inválido o expirado:', error)
            clearAuth()
            return false
        }
    }

    async function login(credentials) {
        loading.value = true
        try {
            const response = await axios.post('/auth/login', credentials)
            setAuth(response.data.user, response.data.token)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' }
        } finally {
            loading.value = false
        }
    }

    async function register(userData) {
        loading.value = true
        try {
            const response = await axios.post('/auth/register', userData)
            setAuth(response.data.user, response.data.token)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' }
        } finally {
            loading.value = false
        }
    }

    function logout() {
        clearAuth()
    }

    return {
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        checkAuth
    }
})
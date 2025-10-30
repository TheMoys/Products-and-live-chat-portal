import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/services/axios'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || null)

    const isAuthenticated = computed(() => !!token.value)
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

    function checkAuth() {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
            token.value = storedToken
            user.value = JSON.parse(storedUser)
        }
    }

    async function login(credentials) {
        try {
            const response = await axios.post('/auth/login', credentials)
            setAuth(response.data.user, response.data.token)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' }
        }
    }

    async function register(userData) {
        try {
            const response = await axios.post('/auth/register', userData)
            setAuth(response.data.user, response.data.token)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' }
        }
    }

    function logout() {
        clearAuth()
    }

    return {
        user,
        token,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        checkAuth
    }
})
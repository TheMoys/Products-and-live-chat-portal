import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatService } from '@/services/chatService'

export const useChatStore = defineStore('chat', () => {
    const messages = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function loadMessages() {
        loading.value = true
        error.value = null
        try {
            messages.value = await chatService.getMessages()
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al cargar mensajes'
        } finally {
            loading.value = false
        }
    }

    function addMessage(message) {
        messages.value.push(message)
    }

    return {
        messages,
        loading,
        error,
        loadMessages,
        addMessage
    }
})
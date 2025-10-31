<!-- filepath: src/frontend/src/views/ChatView.vue -->
<template>
    <div class="chat-container">
        <header class="chat-header">
            <h1>💬 CHAT GLOBAL</h1>
            <div class="header-actions">
                <button @click="goBack" class="btn-back">← Volver</button>
            </div>
        </header>

        <div class="chat-content">
            <!-- Sidebar de usuarios online -->
            <aside class="chat-sidebar">
                <div class="sidebar-header">
                    <span :class="['status-dot', { connected: connected }]"></span>
                    {{ connected ? 'Conectado' : 'Desconectado' }}
                </div>
                <div class="users-list">
                    <div class="user-item">
                        <div class="user-avatar">{{ getInitials(authStore.user?.username || 'U') }}</div>
                        <div class="user-info">
                            <div class="user-name">{{ authStore.user?.username }}</div>
                            <div class="user-status">
                                <span class="status-dot connected"></span>
                                Tú
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <!-- Área principal del chat -->
            <main class="chat-main">
                <!-- Mensajes -->
                <div class="chat-messages" ref="messagesContainer">
                    <div v-if="messages.length === 0" class="empty-chat">
                        <div class="empty-chat-icon">💬</div>
                        <h3>¡Comienza la conversación!</h3>
                        <p>Sé el primero en enviar un mensaje</p>
                    </div>

                    <div v-for="(message, index) in messages" :key="index"
                        :class="['message', { own: message.user.id === authStore.user?._id }]">
                        <div class="message-avatar">
                            {{ getInitials(message.user.username) }}
                        </div>
                        <div class="message-content">
                            <div class="message-header">
                                <span class="message-sender">{{ message.user.username }}</span>
                                <span class="message-time">{{ formatTime(message.createdAt) }}</span>
                            </div>
                            <div class="message-bubble">
                                {{ message.text }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Input de mensaje -->
                <div class="chat-input-container">
                    <form @submit.prevent="sendMessage" class="chat-input-form">
                        <input type="text" v-model="newMessage" placeholder="Escribe un mensaje..." class="chat-input"
                            :disabled="!connected" />
                        <button type="submit" class="btn-send" :disabled="!newMessage.trim() || !connected">
                            <span>Enviar</span>
                            <span>🚀</span>
                        </button>
                    </form>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSocket } from '@/services/socketService'
import '@/assets/styles/chat.css'

const router = useRouter()
const authStore = useAuthStore()
const { connected, initSocket, sendMessage: emitMessage, onMessage, offMessage, disconnect } = useSocket()

const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

onMounted(() => {
    // Inicializar socket con el token
    const token = localStorage.getItem('token')
    if (token) {
        initSocket(token)

        // Escuchar mensajes entrantes
        onMessage((message) => {
            console.log('Mensaje recibido:', message)
            messages.value.push(message)
            scrollToBottom()
        })
    } else {
        router.push('/login')
    }
})

onUnmounted(() => {
    offMessage()
})

function sendMessage() {
    if (!newMessage.value.trim() || !connected.value) return

    emitMessage(newMessage.value)
    newMessage.value = ''
}

function scrollToBottom() {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}

function getInitials(username) {
    if (!username) return 'U'
    return username
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
}

function formatTime(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function goBack() {
    router.push('/')
}

// Auto-scroll cuando llegan mensajes
watch(messages, () => {
    scrollToBottom()
}, { deep: true })
</script>
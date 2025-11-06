<template>
    <div class="chat-container">
        <header class="chat-header">
            <button @click="goBack" class="btn-back">← Volver</button>
            <h1>💬 CHAT EN VIVO</h1>
            <div class="connection-status" :class="{ connected }">
                <span class="status-dot"></span>
                {{ connected ? 'Conectado' : 'Desconectado' }}
            </div>
        </header>

        <div class="chat-content">
            <aside class="chat-sidebar">
                <div class="user-info">
                    <div class="user-avatar">
                        {{ getInitials(authStore.username) }}
                    </div>
                    <div class="user-details">
                        <h3>{{ authStore.username }}</h3>
                        <p>{{ authStore.user?.username }}</p>
                    </div>
                </div>

                <div class="connected-users">
                    <h3 class="users-title">
                        👥 Conectados ({{ connectedUsers.length }})
                    </h3>

                    <div class="users-list">
                        <div v-for="user in connectedUsers" :key="user.userId"
                            :class="['user-item', { 'current-user': user.username === authStore.username }]">
                            <div class="user-item-avatar">
                                {{ getInitials(user.username) }}
                            </div>
                            <div class="user-item-info">
                                <span class="user-item-name">
                                    {{ user.username }}
                                    <span v-if="user.username === authStore.username" class="you-badge">Tú</span>
                                </span>
                                <span class="user-item-status">En línea</span>
                            </div>
                            <div class="status-indicator"></div>
                        </div>

                        <div v-if="connectedUsers.length === 0" class="no-users">
                            <p>No hay usuarios conectados</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main class="chat-main">
                <div v-if="chatStore.loading" class="loading">
                    <div class="loading-spinner"></div>
                    <p>Cargando mensajes...</p>
                </div>

                <div v-else class="chat-messages" ref="messagesContainer">
                    <div v-for="(message, index) in messages" :key="message._id || index"
                        :class="['message-wrapper', { 'own-message': isOwnMessage(message) }]">
                        <div class="message">
                            <div class="message-avatar">
                                {{ getInitials(message.user?.username || message.username) }}
                            </div>
                            <div class="message-content">
                                <div class="message-header">
                                    <span class="message-username">
                                        {{ message.user?.username || message.username }}
                                    </span>
                                    <span class="message-time">
                                        {{ formatTime(message.createdAt) }}
                                    </span>
                                </div>
                                <div class="message-text">{{ message.text }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="typingText" class="typing-indicator">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="typing-text">{{ typingText }}</span>
                </div>

                <div class="chat-input-container">
                    <input v-model="newMessage" @input="handleInput" @keyup.enter="sendMessage" type="text"
                        class="chat-input" placeholder="Escribe un mensaje..." maxlength="500" :disabled="!connected" />
                    <button @click="sendMessage" class="send-button" :disabled="!newMessage.trim() || !connected">
                        Enviar
                    </button>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useSocket } from '@/services/socketService'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

const {
    socket,
    connected,
    initSocket,
    sendMessage: emitMessage,
    emitTyping,
    emitStopTyping,
    onMessage,
    onUserTyping,
    onUserStopTyping,
    onUsersUpdate,
    offMessage,
    disconnect
} = useSocket()

const newMessage = ref('')
const messagesContainer = ref(null)
const typingUsers = ref([])
let typingTimeout = null
const connectedUsers = ref([])

const messages = computed(() => chatStore.messages)

// Texto de "escribiendo..."
const typingText = computed(() => {
    if (typingUsers.value.length === 0) return ''
    if (typingUsers.value.length === 1) {
        return `${typingUsers.value[0]} está escribiendo...`
    }
    if (typingUsers.value.length === 2) {
        return `${typingUsers.value[0]} y ${typingUsers.value[1]} están escribiendo...`
    }
    return `${typingUsers.value.length} personas están escribiendo...`
})

onMounted(async () => {

    await chatStore.loadMessages()
    scrollToBottom()

    initSocket(authStore.token)

    onMessage((message) => {
        chatStore.addMessage(message)
        scrollToBottom()
    })

    // Escuchar cuando alguien está escribiendo
    onUserTyping((data) => {
        if (!typingUsers.value.includes(data.username)) {
            typingUsers.value.push(data.username)
        }
    })

    // Escuchar cuando alguien dejó de escribir
    onUserStopTyping((data) => {
        typingUsers.value = typingUsers.value.filter(u => u !== data.username)
    })

    onUsersUpdate((users) => {
        console.log('👥 Usuarios conectados:', users)
        connectedUsers.value = users
    })
})

onUnmounted(() => {
    offMessage()
    disconnect()
})

// Manejar cuando el usuario escribe
function handleInput() {
    emitTyping()

    // Cancelar timeout anterior
    if (typingTimeout) {
        clearTimeout(typingTimeout)
    }

    // Después de 1 segundo sin escribir, emitir "stop typing"
    typingTimeout = setTimeout(() => {
        emitStopTyping()
    }, 1000)
}

function sendMessage() {
    const text = newMessage.value.trim()
    if (!text) return

    // Emitir que dejó de escribir
    emitStopTyping()
    if (typingTimeout) {
        clearTimeout(typingTimeout)
    }

    emitMessage(text)
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
    const parts = username.split(' ')
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return username.substring(0, 2).toUpperCase()
}

function formatTime(date) {
    if (!date) return ''
    const d = new Date(date)
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

function isOwnMessage(message) {
    const messageUserId = message.user?.id || message.user?._id || message.user
    const currentUserId = authStore.user?._id || authStore.user?.id

    return messageUserId === currentUserId
}

function goBack() {
    router.push('/')
}
</script>
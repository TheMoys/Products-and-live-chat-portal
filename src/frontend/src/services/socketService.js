import { io } from 'socket.io-client'
import { ref } from 'vue'

let socket = null
const connected = ref(false)

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin.replace(':5173', ':3000')

export function useSocket() {
    const initSocket = (token) => {
        if (socket) return socket

        socket = io(BACKEND_URL, {
            auth: {
                token: token
            }
        })

        socket.on('connect', () => {
            connected.value = true
            console.log('Socket conectado:', socket.id)
        })

        socket.on('disconnect', () => {
            connected.value = false
            console.log('Socket desconectado')
        })

        socket.on('connect_error', (error) => {
            console.error('Error de conexión:', error.message)
        })

        return socket
    }

    const sendMessage = (text) => {
        if (socket && connected.value) {
            socket.emit('chat:message', { text })
        }
    }

    const onMessage = (callback) => {
        if (socket) {
            socket.on('chat:message', callback)
        }
    }

    const offMessage = () => {
        if (socket) {
            socket.off('chat:message')
        }
    }

    const disconnect = () => {
        if (socket) {
            socket.disconnect()
            socket = null
            connected.value = false
        }
    }

    const emitTyping = () => {
        if (socket && connected.value) {
            socket.emit('chat:typing')
        }
    }

    const emitStopTyping = () => {
        if (socket && connected.value) {
            socket.emit('chat:stop-typing')
        }
    }

    const onUserTyping = (callback) => {
        if (socket) {
            socket.on('chat:user-typing', callback)
        }
    }

    const onUserStopTyping = (callback) => {
        if (socket) {
            socket.on('chat:user-stop-typing', callback)
        }
    }

    return {
        socket,
        connected,
        initSocket,
        sendMessage,
        onMessage,
        offMessage,
        disconnect,
        emitTyping,
        emitStopTyping,
        onUserTyping,
        onUserStopTyping
    }
}
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

    return {
        socket,
        connected,
        initSocket,
        sendMessage,
        onMessage,
        offMessage,
        disconnect
    }
}
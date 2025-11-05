import axios from './axios'

export const chatService = {
    async getMessages(limit = 50) {
        const response = await axios.get('/chat/messages', {
            params: { limit }
        })
        return response.data
    }
}
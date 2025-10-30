import axios from './axios'

export const productService = {
    async getAll() {
        const response = await axios.get('/products')
        return response.data
    },

    async getById(id) {
        const response = await axios.get(`/products/${id}`)
        return response.data
    },

    async create(productData) {
        const response = await axios.post('/products', productData)
        return response.data
    },

    async update(id, productData) {
        const response = await axios.put(`/products/${id}`, productData)
        return response.data
    },

    async delete(id) {
        const response = await axios.delete(`/products/${id}`)
        return response.data
    }
}
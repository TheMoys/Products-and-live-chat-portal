import axios from './axios'

export const productService = {
    async getAllProducts() {
        const response = await axios.get('/products')
        return response.data
    },

    async createProduct(productData) {
        const response = await axios.post('/products', {
            title: productData.title,
            description: productData.description || '',
            price: productData.price,
            stock: productData.stock,
            imageUrl: productData.imageUrl || null,
            imageData: productData.imageData || null
        })
        return response.data
    },

    async updateProduct(id, productData) {
        const response = await axios.put(`/products/${id}`, {
            title: productData.title,
            description: productData.description || '',
            price: productData.price,
            stock: productData.stock,
            imageUrl: productData.imageUrl || null,
            imageData: productData.imageData || null
        })
        return response.data
    },

    async deleteProduct(id) {
        const response = await axios.delete(`/products/${id}`)
        return response.data
    }
}
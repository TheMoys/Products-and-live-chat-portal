import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productService } from '@/services/productService'

export const useProductStore = defineStore('products', () => {
    const products = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchProducts() {
        loading.value = true
        error.value = null
        try {
            products.value = await productService.getAllProducts()
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al cargar productos'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function createProduct(productData) {
        loading.value = true
        error.value = null
        try {
            const newProduct = await productService.createProduct(productData)
            products.value.push(newProduct)
            return newProduct
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al crear producto'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateProduct(id, productData) {
        loading.value = true
        error.value = null
        try {
            const updated = await productService.updateProduct(id, productData)
            const index = products.value.findIndex(p => p._id === id)
            if (index !== -1) {
                products.value[index] = updated
            }
            return updated
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al actualizar producto'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteProduct(id) {
        loading.value = true
        error.value = null
        try {
            await productService.deleteProduct(id)
            products.value = products.value.filter(p => p._id !== id)
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al eliminar producto'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        products,
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct
    }
})
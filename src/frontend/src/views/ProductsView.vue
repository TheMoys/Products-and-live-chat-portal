<!-- filepath: src/frontend/src/views/ProductsView.vue -->
<template>
    <div class="products-container">
        <header class="products-header">
            <h1>🎮 PRODUCTOS</h1>
            <div class="header-actions">
                <button @click="goBack" class="btn-back">← Volver</button>
                <button v-if="authStore.isAdmin" @click="openModal()" class="btn-add">
                    + Agregar Producto
                </button>
            </div>
        </header>

        <div class="products-content">
            <!-- Loading -->
            <div v-if="productStore.loading" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando productos...</p>
            </div>

            <!-- Error -->
            <div v-else-if="productStore.error" class="error-message">
                {{ productStore.error }}
            </div>

            <!-- Empty State -->
            <div v-else-if="productStore.products.length === 0" class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No hay productos</h3>
                <p v-if="authStore.isAdmin">Agrega tu primer producto para comenzar</p>
            </div>

            <!-- Products Grid -->
            <div v-else class="products-grid">
                <div v-for="product in productStore.products" :key="product._id" class="product-card">
                    <div class="product-image">🎮</div>
                    <div class="product-info">
                        <h3>{{ product.title }}</h3>
                        <p>{{ product.description || 'Sin descripción' }}</p>
                        <div class="product-meta">
                            <span class="product-price">${{ product.price.toFixed(2) }}</span>
                            <span class="product-stock" :class="{
                                low: product.stock > 0 && product.stock <= 5,
                                out: product.stock === 0
                            }">
                                {{ product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado' }}
                            </span>
                        </div>
                    </div>
                    <div v-if="authStore.isAdmin" class="product-actions">
                        <button @click="openModal(product)" class="btn-edit">
                            Editar
                        </button>
                        <button @click="handleDelete(product._id)" class="btn-delete">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Create/Edit -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
                    <button @click="closeModal" class="btn-close">×</button>
                </div>

                <form @submit.prevent="handleSubmit" class="product-form">
                    <div class="input-group">
                        <label for="name">Nombre del Producto</label>
                        <input type="text" id="name" v-model="form.title" placeholder="Ej: Cyberpunk 2077" required />
                    </div>

                    <div class="input-group">
                        <label for="description">Descripción</label>
                        <textarea id="description" v-model="form.description" placeholder="Descripción del producto..."
                            rows="4"></textarea>
                    </div>

                    <div class="input-group">
                        <label for="price">Precio ($)</label>
                        <input type="number" id="price" v-model.number="form.price" placeholder="0.00" step="0.01"
                            min="0" required />
                    </div>

                    <div class="input-group">
                        <label for="stock">Stock</label>
                        <input type="number" id="stock" v-model.number="form.stock" placeholder="0" min="0" required />
                    </div>

                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>

                    <div class="form-actions">
                        <button type="button" @click="closeModal" class="btn-cancel">
                            Cancelar
                        </button>
                        <button type="submit" class="btn-submit" :disabled="loading">
                            <span v-if="!loading">{{ editingProduct ? 'Actualizar' : 'Crear' }}</span>
                            <span v-else class="loader"></span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/products'
import '@/assets/styles/products.css'

const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

const showModal = ref(false)
const editingProduct = ref(null)
const loading = ref(false)
const error = ref(null)

const form = ref({
    name: '',
    description: '',
    price: 0,
    stock: 0
})

onMounted(() => {
    productStore.fetchProducts()
})

function goBack() {
    router.push('/')
}

function openModal(product = null) {
    if (product) {
        editingProduct.value = product
        form.value = {
            name: product.title,
            description: product.description || '',
            price: product.price,
            stock: product.stock
        }
    } else {
        editingProduct.value = null
        form.value = {
            name: '',
            description: '',
            price: 0,
            stock: 0
        }
    }
    showModal.value = true
    error.value = null
}

function closeModal() {
    showModal.value = false
    editingProduct.value = null
    error.value = null
}

async function handleSubmit() {
    loading.value = true
    error.value = null

    try {
        if (editingProduct.value) {
            await productStore.updateProduct(editingProduct.value._id, form.value)
        } else {
            await productStore.createProduct(form.value)
        }
        closeModal()
    } catch (err) {
        error.value = err.response?.data?.message || 'Error al guardar producto'
    } finally {
        loading.value = false
    }
}

async function handleDelete(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
        await productStore.deleteProduct(id)
    } catch (err) {
        alert('Error al eliminar producto')
    }
}
</script>
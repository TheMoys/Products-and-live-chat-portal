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
            <div v-if="productStore.loading" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando productos...</p>
            </div>

            <div v-else-if="productStore.error" class="error-message">
                {{ productStore.error }}
            </div>

            <div v-else-if="productStore.products.length === 0" class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No hay productos</h3>
                <p v-if="authStore.isAdmin">Agrega tu primer producto para comenzar</p>
            </div>

            <div v-else class="products-grid">
                <div v-for="product in productStore.products" :key="product._id" class="product-card">
                    <!-- Imagen del producto -->
                    <div class="product-image">
                        <img v-if="product.imageData || product.imageUrl" :src="product.imageData || product.imageUrl"
                            :alt="product.title" @error="handleImageError" />
                        <span v-else class="product-icon">🎮</span>
                    </div>

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
                        <button @click="openModal(product)" class="btn-edit">Editar</button>
                        <button @click="handleDelete(product._id)" class="btn-delete">Eliminar</button>
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
                    <!-- TABS: Subir archivo O URL -->
                    <div class="input-group">
                        <label>Imagen del Producto</label>
                        <div class="image-tabs">
                            <button type="button" :class="['tab-btn', { active: imageMode === 'upload' }]"
                                @click="imageMode = 'upload'">
                                📁 Subir Archivo
                            </button>
                            <button type="button" :class="['tab-btn', { active: imageMode === 'url' }]"
                                @click="imageMode = 'url'">
                                🔗 URL Externa
                            </button>
                        </div>

                        <!-- Upload de archivo -->
                        <div v-if="imageMode === 'upload'" class="upload-section">
                            <input type="file" @change="handleFileChange" accept="image/*" ref="fileInput"
                                style="display: none" />
                            <button type="button" @click="$refs.fileInput.click()" class="btn-upload">
                                {{ imagePreview ? '✏️ Cambiar Imagen' : '📷 Seleccionar Imagen' }}
                            </button>
                            <div v-if="imagePreview" class="image-preview">
                                <img :src="imagePreview" alt="Preview" />
                            </div>
                        </div>

                        <!-- URL externa -->
                        <div v-else class="url-section">
                            <input type="url" v-model="form.imageUrl" placeholder="https://ejemplo.com/imagen.jpg"
                                @input="updateUrlPreview" />
                            <div v-if="form.imageUrl" class="image-preview">
                                <img :src="form.imageUrl" alt="Preview" @error="imageError = true" />
                                <p v-if="imageError" class="error-text">⚠️ URL inválida</p>
                            </div>
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="title">Título del Producto</label>
                        <input type="text" id="title" v-model="form.title" placeholder="Ej: Cyberpunk 2077" required />
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
                        <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
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
import { ref, onMounted, watch } from 'vue'
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
const imageError = ref(false)
const imageMode = ref('upload') // 'upload' o 'url'
const imagePreview = ref(null)
const fileInput = ref(null)

const form = ref({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    imageData: ''
})

onMounted(() => {
    productStore.fetchProducts()
})

watch(() => form.value.imageUrl, () => {
    imageError.value = false
})

function goBack() {
    router.push('/')
}

function openModal(product = null) {
    if (product) {
        editingProduct.value = product
        form.value = {
            title: product.title,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl || '',
            imageData: product.imageData || ''
        }

        // Mostrar preview de imagen existente
        if (product.imageData) {
            imageMode.value = 'upload'
            imagePreview.value = product.imageData
        } else if (product.imageUrl) {
            imageMode.value = 'url'
        }
    } else {
        editingProduct.value = null
        form.value = {
            title: '',
            description: '',
            price: 0,
            stock: 0,
            imageUrl: '',
            imageData: ''
        }
        imagePreview.value = null
    }
    showModal.value = true
    error.value = null
    imageError.value = false
}

function closeModal() {
    showModal.value = false
    editingProduct.value = null
    error.value = null
    imageError.value = false
    imagePreview.value = null
}

// Convertir archivo a Base64
function handleFileChange(event) {
    const file = event.target.files[0]
    if (!file) return

    // Validar tamaño (máximo 2MB para mejor rendimiento)
    if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 2MB.')
        return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
        const base64 = e.target.result
        form.value.imageData = base64
        form.value.imageUrl = '' // Limpiar URL si había
        imagePreview.value = base64
    }
    reader.readAsDataURL(file)
}

function updateUrlPreview() {
    form.value.imageData = '' // Limpiar base64 si había
    imageError.value = false
}

function handleImageError(event) {
    event.target.style.display = 'none'
    event.target.parentElement.innerHTML = '<span class="product-icon">🎮</span>'
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
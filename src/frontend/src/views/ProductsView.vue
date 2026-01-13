<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()
const cartStore = useCartStore()

const showModal = ref(false)
const editingProduct = ref(null)
const loading = ref(false)
const error = ref(null)
const imageError = ref(false)
const imageMode = ref('upload')
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
    cartStore.fetchCart()
})

watch(() => form.value.imageUrl, () => {
    imageError.value = false
})

function goBack() {
    router.push('/')
}

async function addToCart(product) {
    try {
        await cartStore.addItem(product._id, 1)
        alert(`"${product.title}" agregado al carrito`)
    } catch (err) {
        alert('Error al agregar al carrito')
    }
}

function isInCart(productId) {
    return cartStore.cart?.items?.some(item => item.product.id === productId || item.product._id === productId)
}

function goToCart() {
    router.push('/cart')
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

<template>
    <div class="products-container">
        <header class="products-header">
            <h1>PRODUCTOS</h1>
            <div class="header-actions">
                <button @click="goBack" class="btn btn-secondary">← Volver</button>
                
                <button v-if="!authStore.isAdmin" @click="goToCart" class="btn btn-primary">
                    Carrito
                    <span v-if="cartStore.itemCount > 0" class="cart-badge">
                        {{ cartStore.itemCount }}
                    </span>
                </button>

                <button v-if="authStore.isAdmin" @click="openModal()" class="btn btn-success">
                    + Agregar Producto
                </button>
            </div>
        </header>

        <div class="products-content">
            <div v-if="productStore.loading" class="loading-container">
                <div class="spinner"></div>
                <p class="text-secondary">Cargando productos...</p>
            </div>

            <div v-else-if="productStore.error" class="alert alert-danger">
                {{ productStore.error }}
            </div>

            <div v-else-if="productStore.products.length === 0" class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3 class="empty-state-text">No hay productos</h3>
                <p v-if="authStore.isAdmin" class="text-secondary">Agrega tu primer producto para comenzar</p>
            </div>

            <div v-else class="products-grid">
                <div v-for="product in productStore.products" :key="product._id" class="product-card">
                    <div class="product-image-container">
                        <span 
                          v-if="product.stock === 0" 
                          class="stock-badge out-of-stock"
                        >
                          SIN STOCK
                        </span>
                        <span 
                          v-else-if="product.stock <= 5" 
                          class="stock-badge low-stock"
                        >
                          POCO STOCK
                        </span>
                        <span 
                          v-else 
                          class="stock-badge in-stock"
                        >
                          DISPONIBLE
                        </span>

                        <div v-if="!authStore.isAdmin && isInCart(product._id)" class="in-cart-badge">
                            En carrito
                        </div>

                        <img 
                          v-if="product.imageData || product.imageUrl" 
                          :src="product.imageData || product.imageUrl"
                          :alt="product.title" 
                          class="product-image"
                          @error="handleImageError" 
                        />
                        <div v-else class="product-image" style="display: flex; align-items: center; justify-content: center; font-size: 48px;">
                          🎮
                        </div>
                    </div>

                    <div class="product-content">
                        <h3 class="product-name">{{ product.title }}</h3>
                        <p class="product-description">{{ product.description || 'Sin descripción' }}</p>
                        <div class="product-meta">
                            <span class="product-price">${{ product.price.toFixed(2) }}</span>
                            <span class="product-stock">
                                Stock: {{ product.stock }}
                            </span>
                        </div>

                        <div v-if="!authStore.isAdmin" class="product-actions">
                          <button 
                            v-if="product.stock > 0"
                            @click="addToCart(product)"
                            class="btn btn-primary"
                            :disabled="cartStore.loading"
                          >
                            <span v-if="isInCart(product._id)">Agregar más</span>
                            <span v-else>Añadir al carrito</span>
                          </button>
                          
                          <button v-else class="btn btn-danger" disabled>
                            Sin stock
                          </button>
                        </div>

                        <div v-if="authStore.isAdmin" class="admin-actions">
                            <button @click="openModal(product)" class="btn btn-warning btn-small">Editar</button>
                            <button @click="handleDelete(product._id)" class="btn btn-danger btn-small">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
                    <button @click="closeModal" class="modal-close">×</button>
                </div>

                <form @submit.prevent="handleSubmit" class="product-form">
                    <div class="form-group">
                        <label>Imagen del Producto</label>
                        <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm);">
                            <button 
                              type="button" 
                              :class="['btn', 'btn-small', imageMode === 'upload' ? 'btn-primary' : 'btn-outline']"
                              @click="imageMode = 'upload'"
                            >
                                Subir Archivo
                            </button>
                            <button 
                              type="button" 
                              :class="['btn', 'btn-small', imageMode === 'url' ? 'btn-primary' : 'btn-outline']"
                              @click="imageMode = 'url'"
                            >
                                URL Externa
                            </button>
                        </div>

                        <div v-if="imageMode === 'upload'">
                            <input 
                              type="file" 
                              @change="handleFileChange" 
                              accept="image/*" 
                              ref="fileInput"
                              style="display: none" 
                            />
                            <button 
                              type="button" 
                              @click="$refs.fileInput.click()" 
                              class="btn btn-outline"
                              style="width: 100%;"
                            >
                                {{ imagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen' }}
                            </button>
                            <img 
                              v-if="imagePreview" 
                              :src="imagePreview" 
                              alt="Preview" 
                              class="image-preview"
                              style="margin-top: var(--spacing-sm);"
                            />
                        </div>

                        <div v-else>
                            <input 
                              type="url" 
                              v-model="form.imageUrl" 
                              placeholder="https://ejemplo.com/imagen.jpg"
                              class="input-field"
                            />
                            <img 
                              v-if="form.imageUrl && !imageError" 
                              :src="form.imageUrl" 
                              alt="Preview" 
                              @error="imageError = true"
                              class="image-preview"
                              style="margin-top: var(--spacing-sm);"
                            />
                            <p v-if="imageError" class="alert alert-warning" style="margin-top: var(--spacing-sm);">
                              URL inválida o imagen no disponible
                            </p>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="title">Título del Producto</label>
                        <input 
                          type="text" 
                          id="title" 
                          v-model="form.title" 
                          placeholder="Ej: Cyberpunk 2077" 
                          class="input-field"
                          required 
                        />
                    </div>

                    <div class="form-group">
                        <label for="description">Descripción</label>
                        <textarea 
                          id="description" 
                          v-model="form.description" 
                          placeholder="Descripción del producto..."
                          class="input-field"
                          rows="4"
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label for="price">Precio ($)</label>
                        <input 
                          type="number" 
                          id="price" 
                          v-model.number="form.price" 
                          placeholder="0.00" 
                          step="0.01"
                          min="0" 
                          class="input-field"
                          required 
                        />
                    </div>

                    <div class="form-group">
                        <label for="stock">Stock</label>
                        <input 
                          type="number" 
                          id="stock" 
                          v-model.number="form.stock" 
                          placeholder="0" 
                          min="0"
                          class="input-field"
                          required 
                        />
                    </div>

                    <div v-if="error" class="alert alert-danger">
                        {{ error }}
                    </div>

                    <div class="form-actions">
                        <button type="button" @click="closeModal" class="btn btn-secondary">Cancelar</button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            <span v-if="!loading">{{ editingProduct ? 'Actualizar' : 'Crear' }}</span>
                            <span v-else class="spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style src="@/assets/styles/products.css"></style>
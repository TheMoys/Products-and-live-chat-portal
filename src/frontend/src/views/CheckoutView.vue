<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useOrdersStore } from '@/stores/orders';

const router = useRouter();
const cartStore = useCartStore();
const ordersStore = useOrdersStore();

const form = ref({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
});

const loading = ref(false);
const error = ref(null);
const formErrors = ref({});

onMounted(() => {
    cartStore.fetchCart();
});

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(price);
};

const validateForm = () => {
    formErrors.value = {};

    if (!form.value.street.trim()) {
        formErrors.value.street = 'La dirección es requerida';
    }

    if (!form.value.city.trim()) {
        formErrors.value.city = 'La ciudad es requerida';
    }

    if (!form.value.state.trim()) {
        formErrors.value.state = 'El estado es requerido';
    }

    if (!form.value.zipCode.trim()) {
        formErrors.value.zipCode = 'El código postal es requerido';
    } else if (!/^\d{5}$/.test(form.value.zipCode)) {
        formErrors.value.zipCode = 'El código postal debe tener 5 dígitos';
    }

    if (!form.value.country.trim()) {
        formErrors.value.country = 'El país es requerido';
    }

    return Object.keys(formErrors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    if (cartStore.isEmpty) {
        error.value = 'El carrito está vacío';
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        const result = await ordersStore.createOrder(form.value);

        if (result.success) {
            await cartStore.fetchCart();
            router.push('/my-orders');
        } else {
            error.value = result.error || 'Error al crear el pedido';
        }
    } catch (err) {
        error.value = err.message || 'Error al procesar el pedido';
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/cart');
};

const getProductImage = (product) => {
    if (product.imageData) return product.imageData;
    if (product.imageUrl) return product.imageUrl;
    return 'https://via.placeholder.com/80?text=Sin+Imagen';
};
</script>

<style src="@/assets/styles/checkout.css"></style>

<template>
    <div class="checkout-view">
        <div class="checkout-container">
            <div class="checkout-header">
                <h1 class="page-title">💳 Finalizar Compra</h1>
                <button @click="handleCancel" class="btn btn-secondary">← Volver</button>
            </div>

            <!-- Loading -->
            <div v-if="cartStore.loading" class="flex-center flex-col gap-md" style="min-height: 400px;">
                <div class="spinner"></div>
                <p class="text-secondary">Cargando información...</p>
            </div>

            <!-- Error de carrito vacío -->
            <div v-else-if="cartStore.isEmpty" class="card text-center p-lg">
                <div style="font-size: 80px; margin-bottom: var(--spacing-md);">🛒</div>
                <h2 class="section-title mb-sm">Tu carrito está vacío</h2>
                <p class="text-secondary mb-md">Agrega productos antes de hacer checkout</p>
                <router-link to="/products" class="btn btn-primary">
                    🛍️ Ir a Productos
                </router-link>
            </div>

            <!-- Formulario y resumen -->
            <div v-else class="checkout-content">
                <div class="checkout-form card">
                    <h2 class="section-title">📍 Dirección de Envío</h2>

                    <form @submit.prevent="handleSubmit">
                        <div class="form-row">
                            <div class="input-group" :class="{ error: formErrors.street }">
                                <label for="street">Dirección *</label>
                                <input id="street" v-model="form.street" type="text" class="input-field"
                                    placeholder="Calle, número, colonia" :disabled="loading" />
                                <span v-if="formErrors.street" class="error-message">
                                    {{ formErrors.street }}
                                </span>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group" :class="{ error: formErrors.city }">
                                <label for="city">Ciudad *</label>
                                <input id="city" v-model="form.city" type="text" class="input-field" placeholder="Ciudad"
                                    :disabled="loading" />
                                <span v-if="formErrors.city" class="error-message">
                                    {{ formErrors.city }}
                                </span>
                            </div>

                            <div class="input-group" :class="{ error: formErrors.state }">
                                <label for="state">Estado *</label>
                                <input id="state" v-model="form.state" type="text" class="input-field" placeholder="Estado"
                                    :disabled="loading" />
                                <span v-if="formErrors.state" class="error-message">
                                    {{ formErrors.state }}
                                </span>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group" :class="{ error: formErrors.zipCode }">
                                <label for="zipCode">Código Postal *</label>
                                <input id="zipCode" v-model="form.zipCode" type="text" class="input-field" placeholder="12345" maxlength="5"
                                    :disabled="loading" />
                                <span v-if="formErrors.zipCode" class="error-message">
                                    {{ formErrors.zipCode }}
                                </span>
                            </div>

                            <div class="input-group" :class="{ error: formErrors.country }">
                                <label for="country">País *</label>
                                <input id="country" v-model="form.country" type="text" class="input-field" placeholder="México"
                                    :disabled="loading" />
                                <span v-if="formErrors.country" class="error-message">
                                    {{ formErrors.country }}
                                </span>
                            </div>
                        </div>

                        <!-- Error general -->
                        <div v-if="error" class="alert alert-danger">
                            ❌ {{ error }}
                        </div>

                        <!-- Botones -->
                        <div class="form-actions">
                            <button type="button" @click="handleCancel" class="btn btn-secondary" :disabled="loading">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-success btn-large" :disabled="loading">
                                <span v-if="loading">
                                    <div class="btn-spinner"></div>
                                    Procesando...
                                </span>
                                <span v-else">
                                    Confirmar Pedido
                                </span>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Resumen del pedido (sidebar) -->
                <div class="order-summary card">
                    <h2 class="section-title">📦 Resumen del Pedido</h2>

                    <div class="summary-items">
                        <div v-for="item in cartStore.cart.items" :key="item.product._id" class="summary-item">
                            <img :src="getProductImage(item.product)" :alt="item.product.title" />
                            <div class="summary-item-info">
                                <h4>{{ item.product.title }}</h4>
                                <p>Cantidad: {{ item.quantity }}</p>
                                <p class="item-price">{{ formatPrice(item.price * item.quantity) }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="summary-divider"></div>

                    <div class="summary-total">
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span>{{ formatPrice(cartStore.totalAmount) }}</span>
                        </div>
                        <div class="summary-row">
                            <span>Envío</span>
                            <span>Gratis 🎁</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>{{ formatPrice(cartStore.totalAmount) }}</span>
                        </div>
                    </div>

                    <div class="summary-info">
                        <p>✅ Pago seguro</p>
                        <p>📦 Envío en 3-5 días hábiles</p>
                        <p>🔄 Devoluciones gratis</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();

onMounted(() => {
  cartStore.fetchCart();
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price);
};

const handleUpdateQuantity = async (productId, newQuantity) => {
  if (newQuantity < 1) return;
  await cartStore.updateItem(productId, newQuantity);
};

const handleRemoveItem = async (productId) => {
  if (confirm('¿Eliminar este producto del carrito?')) {
    await cartStore.removeItem(productId);
  }
};

const handleClearCart = async () => {
  if (confirm('¿Vaciar todo el carrito?')) {
    await cartStore.clearCart();
  }
};

const handleCheckout = () => {
  router.push('/checkout');
};

const getProductImage = (product) => {
  return product.image || 'https://via.placeholder.com/150?text=Sin+Imagen';
};
</script>

<style src="@/assets/styles/cart.css"></style>

<template>
  <div class="cart-view">
    <div class="cart-container">
      <!-- Header -->
      <div class="flex-between mb-lg">
        <h1 class="page-title">🛒 Mi Carrito</h1>
        <button 
          v-if="!cartStore.isEmpty" 
          @click="handleClearCart"
          class="btn btn-danger btn-small"
        >
          🗑️ Vaciar
        </button>
      </div>

      <!-- Loading -->
      <div v-if="cartStore.loading" class="flex-center flex-col gap-md" style="min-height: 400px;">
        <div class="spinner"></div>
        <p class="text-secondary">Cargando carrito...</p>
      </div>

      <!-- Error -->
      <div v-else-if="cartStore.error" class="alert alert-danger">
        <p>❌ {{ cartStore.error }}</p>
        <button @click="cartStore.fetchCart()" class="btn btn-primary btn-small mt-sm">
          🔄 Reintentar
        </button>
      </div>

      <!-- Carrito vacío -->
      <div v-else-if="cartStore.isEmpty" class="card text-center p-lg">
        <div style="font-size: 80px; margin-bottom: var(--spacing-md);">🛒</div>
        <h2 class="section-title mb-sm">Tu carrito está vacío</h2>
        <p class="text-secondary mb-md">Agrega productos para comenzar tu compra</p>
        <router-link to="/products" class="btn btn-primary">
          🛍️ Ir a Productos
        </router-link>
      </div>

      <!-- Carrito con items -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <div 
            v-for="item in cartStore.cart.items" 
            :key="item.product.id"
            class="card cart-item"
          >
            <div class="item-image">
              <img 
                :src="getProductImage(item.product)" 
                :alt="item.product.title"
              >
            </div>

            <div class="item-details">
              <h3 class="item-title">{{ item.product.title }}</h3>
              <p class="text-secondary item-description">{{ item.product.description }}</p>
              <p class="mt-sm">
                <span v-if="item.product.stock > 10" class="badge badge-success">
                  En stock
                </span>
                <span v-else-if="item.product.stock > 0" class="badge badge-warning">
                  ⚠️ Últimas {{ item.product.stock }} unidades
                </span>
                <span v-else class="badge badge-danger">
                  ❌ Sin stock
                </span>
              </p>
            </div>

            <div class="item-quantity">
              <button 
                @click="handleUpdateQuantity(item.product.id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
                class="btn btn-outline btn-small qty-btn"
              >
                −
              </button>
              <input 
                type="number" 
                :value="item.quantity"
                @change="handleUpdateQuantity(item.product.id, parseInt($event.target.value))"
                min="1"
                :max="item.product.stock"
                class="input-field qty-input"
              >
              <button 
                @click="handleUpdateQuantity(item.product.id, item.quantity + 1)"
                :disabled="item.quantity >= item.product.stock"
                class="btn btn-outline btn-small qty-btn"
              >
                +
              </button>
            </div>

            <div class="item-price">
              <p class="text-muted">{{ formatPrice(item.price) }} c/u</p>
              <p class="price-total">{{ formatPrice(item.price * item.quantity) }}</p>
            </div>

            <button 
              @click="handleRemoveItem(item.product.id)"
              class="btn btn-danger btn-small"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Resumen de compra -->
        <div class="cart-summary">
          <div class="card">
            <h2 class="section-title mb-md">Resumen de Compra</h2>
            
            <div class="summary-row">
              <span>Subtotal ({{ cartStore.itemCount }} items)</span>
              <span>{{ formatPrice(cartStore.totalAmount) }}</span>
            </div>

            <div class="summary-row">
              <span>Envío</span>
              <span class="free-shipping">GRATIS 🎉</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row summary-total">
              <span>Total</span>
              <span>{{ formatPrice(cartStore.totalAmount) }}</span>
            </div>

            <button 
              @click="handleCheckout"
              class="btn btn-success btn-large mt-md"
              style="width: 100%;"
              :disabled="cartStore.isEmpty"
            >
              💳 Proceder al Pago
            </button>

            <router-link to="/products" class="btn btn-outline mt-sm" style="width: 100%; text-align: center; display: block; padding: 12px;">
              ← Continuar Comprando
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
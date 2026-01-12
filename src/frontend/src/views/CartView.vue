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
      <div class="cart-header">
        <h1>🛒 Mi Carrito</h1>
        <button 
          v-if="!cartStore.isEmpty" 
          @click="handleClearCart"
          class="btn-clear"
        >
          🗑️ Vaciar Carrito
        </button>
      </div>

      <!-- Loading -->
      <div v-if="cartStore.loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando carrito...</p>
      </div>

      <!-- Error -->
      <div v-else-if="cartStore.error" class="error-message">
        <p>❌ {{ cartStore.error }}</p>
        <button @click="cartStore.fetchCart()" class="btn-retry">
          🔄 Reintentar
        </button>
      </div>

      <!-- Carrito vacío -->
      <div v-else-if="cartStore.isEmpty" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos para comenzar tu compra</p>
        <router-link to="/products" class="btn-shop">
          🛍️ Ir a Productos
        </router-link>
      </div>

      <!-- Carrito con items -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <div 
            v-for="item in cartStore.cart.items" 
            :key="item.product.id"
            class="cart-item"
          >
            <div class="item-image">
              <img :src="getProductImage(item.product)" :alt="item.product.title">
            </div>

            <div class="item-details">
              <h3>{{ item.product.title }}</h3>
              <p class="item-description">{{ item.product.description }}</p>
              <p class="item-category">📦 {{ item.product.category }}</p>
              <p class="item-stock">
                <span v-if="item.product.stock > 10" class="stock-good">
                  ✅ En stock
                </span>
                <span v-else-if="item.product.stock > 0" class="stock-low">
                  ⚠️ Últimas {{ item.product.stock }} unidades
                </span>
                <span v-else class="stock-out">
                  ❌ Sin stock
                </span>
              </p>
            </div>

            <div class="item-quantity">
              <button 
                @click="handleUpdateQuantity(item.product.id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
                class="qty-btn"
              >
                −
              </button>
              <input 
                type="number" 
                :value="item.quantity"
                @change="handleUpdateQuantity(item.product.id, parseInt($event.target.value))"
                min="1"
                :max="item.product.stock"
                class="qty-input"
              >
              <button 
                @click="handleUpdateQuantity(item.product.id, item.quantity + 1)"
                :disabled="item.quantity >= item.product.stock"
                class="qty-btn"
              >
                +
              </button>
            </div>

            <div class="item-price">
              <p class="price-unit">{{ formatPrice(item.price) }} c/u</p>
              <p class="price-total">{{ formatPrice(item.price * item.quantity) }}</p>
            </div>

            <button 
              @click="handleRemoveItem(item.product.id)"
              class="btn-remove"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Resumen de compra -->
        <div class="cart-summary">
          <h2>Resumen de Compra</h2>
          
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
            class="btn-checkout"
            :disabled="cartStore.isEmpty"
          >
            💳 Proceder al Pago
          </button>

          <router-link to="/products" class="btn-continue">
            ← Continuar Comprando
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
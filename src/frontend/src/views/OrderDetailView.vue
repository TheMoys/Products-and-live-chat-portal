<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrdersStore } from '@/stores/orders';

const route = useRoute();
const router = useRouter();
const ordersStore = useOrdersStore();

const orderId = route.params.id;

onMounted(() => {
  ordersStore.fetchOrderDetail(orderId);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusInfo = (status) => {
  const statuses = {
    pending: { 
      text: 'Pendiente', 
      icon: '⏳', 
      color: '#ffc107',
      description: 'Tu pedido está siendo procesado'
    },
    processing: { 
      text: 'Procesando', 
      icon: '⚙️', 
      color: '#17a2b8',
      description: 'Estamos preparando tu pedido'
    },
    shipped: { 
      text: 'Enviado', 
      icon: '🚚', 
      color: '#28a745',
      description: 'Tu pedido está en camino'
    },
    delivered: { 
      text: 'Entregado', 
      icon: '✅', 
      color: '#28a745',
      description: 'Pedido entregado exitosamente'
    },
    cancelled: { 
      text: 'Cancelado', 
      icon: '❌', 
      color: '#dc3545',
      description: 'Este pedido ha sido cancelado'
    }
  };
  return statuses[status] || statuses.pending;
};

const getProductImage = (product) => {
  if (product?.imageData) return product.imageData;
  if (product?.imageUrl) return product.imageUrl;
  return 'https://via.placeholder.com/150?text=Sin+Imagen';
};

const goBack = () => {
  router.push('/my-orders');
};

const printOrder = () => {
  window.print();
};
</script>

<template>
  <div class="order-detail-view">
    <div class="detail-container">
      
      <!-- Loading -->
      <div v-if="ordersStore.loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando detalles del pedido...</p>
      </div>

      <!-- Error -->
      <div v-else-if="ordersStore.error" class="error-message">
        <p>❌ {{ ordersStore.error }}</p>
        <button @click="ordersStore.fetchOrderDetail(orderId)" class="btn-retry">
          🔄 Reintentar
        </button>
        <button @click="goBack" class="btn-back">
          ← Volver a Mis Pedidos
        </button>
      </div>

      <!-- Detalle de Orden -->
      <div v-else-if="ordersStore.currentOrder" class="order-detail">
        
        <!-- Header con botón volver -->
        <div class="detail-header">
          <button @click="goBack" class="btn-back">
            ← Volver
          </button>
          <button @click="printOrder" class="btn-print">
            🖨️ Imprimir
          </button>
        </div>

        <!-- Información Principal -->
        <div class="order-info-card">
          <div class="order-title">
            <h1>Pedido #{{ ordersStore.currentOrder.orderNumber }}</h1>
            <span 
              class="status-badge-large" 
              :style="{ backgroundColor: getStatusInfo(ordersStore.currentOrder.status).color }"
            >
              {{ getStatusInfo(ordersStore.currentOrder.status).icon }} 
              {{ getStatusInfo(ordersStore.currentOrder.status).text }}
            </span>
          </div>
          
          <p class="status-description">
            {{ getStatusInfo(ordersStore.currentOrder.status).description }}
          </p>

          <div class="order-meta">
            <div class="meta-item">
              <span class="meta-label">📅 Fecha de pedido:</span>
              <span class="meta-value">{{ formatDate(ordersStore.currentOrder.createdAt) }}</span>
            </div>
            <div class="meta-item" v-if="ordersStore.currentOrder.user">
              <span class="meta-label">👤 Cliente:</span>
              <span class="meta-value">{{ ordersStore.currentOrder.user.username }}</span>
            </div>
            <div class="meta-item" v-if="ordersStore.currentOrder.user">
              <span class="meta-label">📧 Email:</span>
              <span class="meta-value">{{ ordersStore.currentOrder.user.email }}</span>
            </div>
          </div>
        </div>

        <!-- Dirección de Envío -->
        <div class="shipping-card" v-if="ordersStore.currentOrder.shippingAddress">
          <h2>📍 Dirección de Envío</h2>
          <div class="address-content">
            <p><strong>{{ ordersStore.currentOrder.shippingAddress.street }}</strong></p>
            <p>{{ ordersStore.currentOrder.shippingAddress.city }}, {{ ordersStore.currentOrder.shippingAddress.state }}</p>
            <p>CP: {{ ordersStore.currentOrder.shippingAddress.zipCode }}</p>
            <p>{{ ordersStore.currentOrder.shippingAddress.country }}</p>
          </div>
        </div>

        <!-- Productos -->
        <div class="products-card">
          <h2>📦 Productos ({{ ordersStore.currentOrder.items.length }})</h2>
          
          <div class="products-list">
            <div 
              v-for="(item, index) in ordersStore.currentOrder.items" 
              :key="index"
              class="product-item"
            >
              <div class="product-image">
                <img :src="getProductImage(item.product)" :alt="item.title">
              </div>
              
              <div class="product-info">
                <h3>{{ item.title }}</h3>
                <p class="product-price">{{ formatPrice(item.price) }} c/u</p>
                <p class="product-quantity">Cantidad: {{ item.quantity }}</p>
              </div>

              <div class="product-total">
                <p class="total-label">Subtotal</p>
                <p class="total-amount">{{ formatPrice(item.price * item.quantity) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de Pago -->
        <div class="payment-summary">
          <h2>💰 Resumen de Pago</h2>
          
          <div class="summary-rows">
            <div class="summary-row">
              <span>Subtotal ({{ ordersStore.currentOrder.items.length }} items)</span>
              <span>{{ formatPrice(ordersStore.currentOrder.totalAmount) }}</span>
            </div>
            <div class="summary-row">
              <span>Envío</span>
              <span class="free">GRATIS 🎉</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row summary-total">
              <span>Total</span>
              <span>{{ formatPrice(ordersStore.currentOrder.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Timeline de Estado -->
        <div class="status-timeline">
          <h2>📊 Estado del Pedido</h2>
          <div class="timeline">
            <div 
              class="timeline-item"
              :class="{ active: ['pending', 'processing', 'shipped', 'delivered'].includes(ordersStore.currentOrder.status) }"
            >
              <div class="timeline-icon">⏳</div>
              <div class="timeline-content">
                <h4>Pendiente</h4>
                <p>Pedido recibido</p>
              </div>
            </div>

            <div 
              class="timeline-item"
              :class="{ active: ['processing', 'shipped', 'delivered'].includes(ordersStore.currentOrder.status) }"
            >
              <div class="timeline-icon">⚙️</div>
              <div class="timeline-content">
                <h4>Procesando</h4>
                <p>Preparando tu pedido</p>
              </div>
            </div>

            <div 
              class="timeline-item"
              :class="{ active: ['shipped', 'delivered'].includes(ordersStore.currentOrder.status) }"
            >
              <div class="timeline-icon">🚚</div>
              <div class="timeline-content">
                <h4>Enviado</h4>
                <p>En camino</p>
              </div>
            </div>

            <div 
              class="timeline-item"
              :class="{ active: ordersStore.currentOrder.status === 'delivered' }"
            >
              <div class="timeline-icon">✅</div>
              <div class="timeline-content">
                <h4>Entregado</h4>
                <p>Pedido completado</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón de Ayuda -->
        <div class="help-section">
          <p>¿Tienes algún problema con tu pedido?</p>
          <router-link to="/chat" class="btn-help">
            💬 Contactar Soporte
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<style src="@/assets/styles/orderDetails.css"></style>
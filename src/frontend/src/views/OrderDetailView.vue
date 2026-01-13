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
      <div v-else-if="ordersStore.error" class="alert alert-danger">
        <p>❌ {{ ordersStore.error }}</p>
        <div class="flex gap-sm mt-sm">
          <button @click="ordersStore.fetchOrderDetail(orderId)" class="btn btn-primary btn-small">
            🔄 Reintentar
          </button>
          <button @click="goBack" class="btn btn-secondary btn-small">
            ← Volver
          </button>
        </div>
      </div>

      <!-- Detalle de Orden -->
      <div v-else-if="ordersStore.currentOrder" class="order-detail">
        
        <!-- Header con botón volver -->
        <div class="detail-header">
          <button @click="goBack" class="btn btn-secondary">
            ← Volver
          </button>
        </div>

        <!-- Información Principal -->
        <div class="order-info-card">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ID de Pedido</span>
              <span class="info-value order-id">{{ ordersStore.currentOrder.orderNumber }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Pedido</span>
              <span class="info-value">{{ formatDate(ordersStore.currentOrder.createdAt) }}</span>
            </div>
            <div class="info-item" v-if="ordersStore.currentOrder.user">
              <span class="info-label">Cliente</span>
              <span class="info-value">{{ ordersStore.currentOrder.user.username }}</span>
            </div>
            <div class="info-item" v-if="ordersStore.currentOrder.user">
              <span class="info-label">Email</span>
              <span class="info-value">{{ ordersStore.currentOrder.user.email }}</span>
            </div>
          </div>
        </div>

        <!-- Estado -->
        <div class="status-section">
          <h2>📊 Estado del Pedido</h2>
          <div class="status-timeline">
            <div 
              v-for="status in ['pending', 'processing', 'shipped', 'delivered']" 
              :key="status"
              class="timeline-item"
            >
              <div 
                :class="['timeline-dot', { 
                  active: ordersStore.currentOrder.status === status 
                }]"
              ></div>
              <div class="timeline-content">
                <div class="timeline-status">
                  {{ getStatusInfo(status).icon }} {{ getStatusInfo(status).text }}
                </div>
                <div class="timeline-date" v-if="ordersStore.currentOrder.status === status">
                  {{ getStatusInfo(status).description }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dirección de Envío -->
        <div class="order-info-card" v-if="ordersStore.currentOrder.shippingAddress">
          <h2 style="margin: 0 0 var(--spacing-md) 0; font-family: var(--font-display); color: var(--text-bright);">📍 Dirección de Envío</h2>
          <div style="display: flex; flex-direction: column; gap: 4px; color: var(--text-primary);">
            <p style="margin: 0;"><strong>{{ ordersStore.currentOrder.shippingAddress.street }}</strong></p>
            <p style="margin: 0;">{{ ordersStore.currentOrder.shippingAddress.city }}, {{ ordersStore.currentOrder.shippingAddress.state }}</p>
            <p style="margin: 0;">CP: {{ ordersStore.currentOrder.shippingAddress.zipCode }}</p>
            <p style="margin: 0;">{{ ordersStore.currentOrder.shippingAddress.country }}</p>
          </div>
        </div>

        <!-- Productos -->
        <div class="products-section">
          <h2>📦 Productos ({{ ordersStore.currentOrder.items.length }})</h2>
          
          <div class="products-list">
            <div 
              v-for="(item, index) in ordersStore.currentOrder.items" 
              :key="index"
              class="product-item"
            >
              <img 
                :src="getProductImage(item.product)" 
                :alt="item.title"
                class="product-image"
              >
              
              <div class="product-info">
                <div class="product-name">{{ item.title }}</div>
                <div class="product-description">{{ item.product?.description || 'Producto' }}</div>
              </div>

              <div class="product-quantity">
                × {{ item.quantity }}
              </div>

              <div class="product-price">
                {{ formatPrice(item.price * item.quantity) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de Pago -->
        <div class="summary-section">
          <h2>💰 Resumen de Pago</h2>
          
          <div>
            <div class="summary-row">
              <span class="summary-label">Subtotal ({{ ordersStore.currentOrder.items.length }} items)</span>
              <span class="summary-value">{{ formatPrice(ordersStore.currentOrder.totalAmount) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Envío</span>
              <span class="summary-value" style="color: var(--steam-green);">GRATIS 🎉</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total</span>
              <span class="summary-value">{{ formatPrice(ordersStore.currentOrder.totalAmount) }}</span>
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
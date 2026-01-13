<script setup>
import { onMounted, computed } from 'vue';
import { useOrdersStore } from '@/stores/orders';
import { useRouter } from 'vue-router';

const ordersStore = useOrdersStore();
const router = useRouter();

onMounted(() => {
  ordersStore.fetchMyOrders();
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price);
};

const goBack = () => {
  router.push('/');
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

const getStatusBadge = (status) => {
  const badges = {
    pending: { text: 'Pendiente', class: 'status-pending', icon: '⏳' },
    processing: { text: 'Procesando', class: 'status-processing', icon: '⚙️' },
    shipped: { text: 'Enviado', class: 'status-shipped', icon: '🚚' },
    delivered: { text: 'Entregado', class: 'status-delivered', icon: '✅' },
    cancelled: { text: 'Cancelado', class: 'status-cancelled', icon: '❌' }
  };
  return badges[status] || badges.pending;
};

const viewOrderDetail = (orderId) => {
  router.push(`/orders/${orderId}`);
};
</script>

<template>
  <div class="my-orders-view">
    <div class="orders-container">
      <div class="orders-header">
        <button @click="goBack" class="btn-back-orders">← Volver</button>
        <h1>📦 Mis Pedidos</h1>
        <p class="subtitle">Historial de todas tus compras</p>
      </div>

      <!-- Loading -->
      <div v-if="ordersStore.loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando pedidos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="ordersStore.error" class="error-message">
        <p>❌ {{ ordersStore.error }}</p>
        <button @click="ordersStore.fetchMyOrders()" class="btn-retry">
          🔄 Reintentar
        </button>
      </div>

      <!-- Sin órdenes -->
      <div v-else-if="!ordersStore.hasOrders" class="empty-orders">
        <div class="empty-icon">📦</div>
        <h2>No tienes pedidos aún</h2>
        <p>Explora nuestros productos y haz tu primera compra</p>
        <router-link to="/products" class="btn-shop">
          🛍️ Ir a Productos
        </router-link>
      </div>

      <!-- Lista de órdenes -->
      <div v-else class="orders-list">
        <!-- Estadísticas -->
        <div class="orders-stats">
          <div class="stat-card">
            <span class="stat-number">{{ ordersStore.orderCount }}</span>
            <span class="stat-label">Total Pedidos</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ ordersStore.pendingOrders.length }}</span>
            <span class="stat-label">⏳ Pendientes</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ ordersStore.completedOrders.length }}</span>
            <span class="stat-label">✅ Completados</span>
          </div>
        </div>

        <!-- Órdenes -->
        <div 
          v-for="order in ordersStore.orders" 
          :key="order.id"
          class="order-card"
        >
          <div class="order-header">
            <div class="order-info">
              <h3>Pedido #{{ order.orderNumber }}</h3>
              <p class="order-date">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="order-status">
              <span :class="['status-badge', getStatusBadge(order.status).class]">
                {{ getStatusBadge(order.status).icon }} {{ getStatusBadge(order.status).text }}
              </span>
            </div>
          </div>

          <div class="order-items">
            <div 
              v-for="(item, index) in order.items.slice(0, 3)" 
              :key="index"
              class="order-item"
            >
              <div class="item-image">
                <img 
                  :src="item.product?.imageData || item.product?.imageUrl || 'https://via.placeholder.com/50'" 
                  :alt="item.title"
                >
              </div>
              <div class="item-details">
                <p class="item-title">{{ item.title }}</p>
                <p class="item-quantity">Cantidad: {{ item.quantity }}</p>
              </div>
              <div class="item-price">
                {{ formatPrice(item.price * item.quantity) }}
              </div>
            </div>
            <p v-if="order.items.length > 3" class="more-items">
              +{{ order.items.length - 3 }} productos más
            </p>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span>Total:</span>
              <strong>{{ formatPrice(order.totalAmount) }}</strong>
            </div>
            <button 
              @click="viewOrderDetail(order.id)" 
              class="btn-details"
            >
              Ver Detalles →
            </button>
          </div>

          <div v-if="order.shippingAddress" class="order-shipping">
            <p class="shipping-label">📍 Enviar a:</p>
            <p class="shipping-address">
              {{ order.shippingAddress.street }}, 
              {{ order.shippingAddress.city }}, 
              {{ order.shippingAddress.state }} 
              {{ order.shippingAddress.zipCode }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="@/assets/styles/myOrders.css"></style>
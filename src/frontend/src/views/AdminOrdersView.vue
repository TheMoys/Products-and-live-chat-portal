<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import orderService from '@/services/orderService';

const router = useRouter();
const authStore = useAuthStore();

const orders = ref([]);
const stats = ref(null);
const loading = ref(false);
const filterStatus = ref('');

onMounted(async () => {
  if (!authStore.isAdmin) {
    alert('⛔ Acceso denegado');
    router.push('/');
    return;
  }
  
  await loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const [ordersData, statsData] = await Promise.all([
      orderService.getAllOrders(filterStatus.value || null),
      orderService.getOrderStats()
    ]);
    
    orders.value = ordersData;
    stats.value = statsData;
  } catch (error) {
    console.error('Error cargando datos:', error);
    alert('❌ Error al cargar datos');
  } finally {
    loading.value = false;
  }
}

async function changeStatus(orderId, newStatus) {
  if (!confirm(`¿Cambiar estado a "${newStatus}"?`)) return;
  
  try {
    await orderService.updateOrderStatus(orderId, newStatus);
    alert('✅ Estado actualizado');
    await loadData();
  } catch (error) {
    alert('❌ Error al actualizar');
    console.error(error);
  }
}

function viewDetail(orderId) {
  router.push(`/orders/${orderId}`);
}

function goBack() {
  router.push('/');
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const statusOptions = [
  { value: 'pending', label: '⏳ Pendiente', color: '#ffc107' },
  { value: 'processing', label: '⚙️ Procesando', color: '#17a2b8' },
  { value: 'shipped', label: '🚚 Enviado', color: '#28a745' },
  { value: 'delivered', label: '✅ Entregado', color: '#28a745' },
  { value: 'cancelled', label: '❌ Cancelado', color: '#dc3545' }
];

const getStatusColor = (status) => {
  return statusOptions.find(s => s.value === status)?.color || '#6c757d';
};
</script>

<template>
  <div class="admin-orders-view">
    <div class="admin-container">
      
      <!-- Header -->
      <div class="admin-header">
        <button @click="goBack" class="btn-back">← Volver</button>
        <h1>🛠️ Gestión de Pedidos</h1>
      </div>

      <!-- Loading -->
      <div v-if="loading && !stats" class="loading">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>

      <template v-else>
        <!-- Estadísticas -->
        <div v-if="stats" class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3>{{ stats.total }}</h3>
              <p>Total Pedidos</p>
            </div>
          </div>

          <div class="stat-card revenue">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3>{{ formatPrice(stats.totalRevenue) }}</h3>
              <p>Ingresos</p>
            </div>
          </div>

          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <h3>{{ stats.pending }}</h3>
              <p>Pendientes</p>
            </div>
          </div>

          <div class="stat-card processing">
            <div class="stat-icon">⚙️</div>
            <div class="stat-content">
              <h3>{{ stats.processing }}</h3>
              <p>Procesando</p>
            </div>
          </div>

          <div class="stat-card shipped">
            <div class="stat-icon">🚚</div>
            <div class="stat-content">
              <h3>{{ stats.shipped }}</h3>
              <p>Enviados</p>
            </div>
          </div>

          <div class="stat-card delivered">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>{{ stats.delivered }}</h3>
              <p>Entregados</p>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="filters">
          <label>Filtrar por estado:</label>
          <select v-model="filterStatus" @change="loadData">
            <option value="">📋 Todos</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>

        <!-- Tabla -->
        <div class="table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Pedido #</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td><strong>{{ order.orderNumber }}</strong></td>
                <td>
                  <div class="customer-info">
                    <strong>{{ order.user.username }}</strong>
                    <small>{{ order.user.email }}</small>
                  </div>
                </td>
                <td>{{ formatDate(order.createdAt) }}</td>
                <td class="text-center">{{ order.items.length }}</td>
                <td><strong>{{ formatPrice(order.totalAmount) }}</strong></td>
                <td>
                  <select 
                    :value="order.status"
                    @change="changeStatus(order.id, $event.target.value)"
                    class="status-select"
                    :style="{ borderColor: getStatusColor(order.status) }"
                  >
                    <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                      {{ status.label }}
                    </option>
                  </select>
                </td>
                <td>
                  <button @click="viewDetail(order.id)" class="btn-view">
                    👁️ Ver
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="orders.length === 0" class="empty-state">
            <p>📦 No hay pedidos</p>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<style src="@/assets/styles/adminOrders.css"></style>
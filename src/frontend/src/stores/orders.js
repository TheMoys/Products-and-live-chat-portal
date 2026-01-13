import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import orderService from '@/services/orderService';

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref([]);
  const currentOrder = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const orderCount = computed(() => orders.value.length);

  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === 'pending')
  );

  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === 'delivered')
  );

  const hasOrders = computed(() => orders.value.length > 0);

  // Actions
  async function fetchMyOrders() {
    loading.value = true;
    error.value = null;
    try {
      orders.value = await orderService.getMyOrders();
    } catch (err) {
      error.value = err.message || 'Error al cargar pedidos';
      console.error('Error fetching orders:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchOrderDetail(orderId) {
    loading.value = true;
    error.value = null;
    try {
      currentOrder.value = await orderService.getOrderDetail(orderId);
      return { success: true, order: currentOrder.value };
    } catch (err) {
      error.value = err.message || 'Error al cargar detalle del pedido';
      console.error('Error fetching order detail:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function createOrder(shippingAddress) {
    loading.value = true;
    error.value = null;
    try {
      const newOrder = await orderService.createOrder(shippingAddress);
      orders.value.unshift(newOrder);
      return { success: true, order: newOrder };
    } catch (err) {
      error.value = err.message || 'Error al crear pedido';
      console.error('Error creating order:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  // Admin actions
  async function fetchAllOrders(status = null) {
    loading.value = true;
    error.value = null;
    try {
      orders.value = await orderService.getAllOrders(status);
    } catch (err) {
      error.value = err.message || 'Error al cargar todos los pedidos';
      console.error('Error fetching all orders:', err);
    } finally {
      loading.value = false;
    }
  }

  async function updateOrderStatus(orderId, status) {
    loading.value = true;
    error.value = null;
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      
      // Actualizar en la lista
      const index = orders.value.findIndex(o => o._id === orderId || o.id === orderId);
      if (index !== -1) {
        orders.value[index] = updatedOrder;
      }
      
      // Actualizar current order si es el mismo
      if (currentOrder.value && (currentOrder.value._id === orderId || currentOrder.value.id === orderId)) {
        currentOrder.value = updatedOrder;
      }
      
      return { success: true, order: updatedOrder };
    } catch (err) {
      error.value = err.message || 'Error al actualizar estado del pedido';
      console.error('Error updating order status:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  function getOrderById(orderId) {
    return orders.value.find(o => o._id === orderId || o.id === orderId);
  }

  function resetOrders() {
    orders.value = [];
    currentOrder.value = null;
    error.value = null;
    loading.value = false;
  }

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,
    
    // Getters
    orderCount,
    pendingOrders,
    completedOrders,
    hasOrders,
    
    // Actions
    fetchMyOrders,
    fetchOrderDetail,
    createOrder,
    fetchAllOrders,
    updateOrderStatus,
    getOrderById,
    resetOrders
  };
});
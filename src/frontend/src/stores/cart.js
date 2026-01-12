import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { cartService } from '@/services/cartService';

export const useCartStore = defineStore('cart', () => {
  // State
  const cart = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const itemCount = computed(() => {
    if (!cart.value || !cart.value.items) return 0;
    return cart.value.items.reduce((total, item) => total + item.quantity, 0);
  });

  const totalAmount = computed(() => {
    if (!cart.value || !cart.value.items) return 0;
    return cart.value.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  });

  const isEmpty = computed(() => {
    return !cart.value || !cart.value.items || cart.value.items.length === 0;
  });

  // Actions
  async function fetchCart() {
    loading.value = true;
    error.value = null;
    try {
      cart.value = await cartService.getCart();
    } catch (err) {
      error.value = err.message || 'Error al cargar el carrito';
      console.error('Error fetching cart:', err);
    } finally {
      loading.value = false;
    }
  }

  async function addItem(productId, quantity = 1) {
    loading.value = true;
    error.value = null;
    try {
      cart.value = await cartService.addItem(productId, quantity);
      return { success: true };
    } catch (err) {
      error.value = err.message || 'Error al agregar producto';
      console.error('Error adding item:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function updateItem(productId, quantity) {
    if (quantity < 1) {
      return await removeItem(productId);
    }

    loading.value = true;
    error.value = null;
    try {
      cart.value = await cartService.updateItem(productId, quantity);
      return { success: true };
    } catch (err) {
      error.value = err.message || 'Error al actualizar cantidad';
      console.error('Error updating item:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function removeItem(productId) {
    loading.value = true;
    error.value = null;
    try {
      cart.value = await cartService.removeItem(productId);
      return { success: true };
    } catch (err) {
      error.value = err.message || 'Error al eliminar producto';
      console.error('Error removing item:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function clearCart() {
    loading.value = true;
    error.value = null;
    try {
      await cartService.clearCart();
      cart.value = { items: [] };
      return { success: true };
    } catch (err) {
      error.value = err.message || 'Error al vaciar carrito';
      console.error('Error clearing cart:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  function getItemQuantity(productId) {
    if (!cart.value || !cart.value.items) return 0;
    const item = cart.value.items.find(i => i.product._id === productId);
    return item ? item.quantity : 0;
  }

  function isInCart(productId) {
    if (!cart.value || !cart.value.items) return false;
    return cart.value.items.some(i => i.product._id === productId);
  }

  function resetCart() {
    cart.value = null;
    error.value = null;
    loading.value = false;
  }

  return {
    // State
    cart,
    loading,
    error,
    
    // Getters
    itemCount,
    totalAmount,
    isEmpty,
    
    // Actions
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemQuantity,
    isInCart,
    resetCart
  };
});
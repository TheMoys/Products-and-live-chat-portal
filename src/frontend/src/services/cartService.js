import axios from 'axios';

const API_URL = 'http://localhost:3000/api/cart';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const cartService = {
  // Obtener carrito del usuario
  async getCart() {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Agregar producto al carrito
  async addItem(productId, quantity = 1) {
    try {
      const response = await axios.post(
        `${API_URL}/items`,
        { productId, quantity },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar cantidad de un producto
  async updateItem(productId, quantity) {
    try {
      const response = await axios.put(
        `${API_URL}/items/${productId}`,
        { quantity },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Eliminar producto del carrito
  async removeItem(productId) {
    try {
      const response = await axios.delete(
        `${API_URL}/items/${productId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Vaciar carrito
  async clearCart() {
    try {
      const response = await axios.delete(API_URL, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
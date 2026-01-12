import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const userService = {
  // Obtener todos los usuarios (Admin)
  async getAllUsers() {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar rol de usuario (Admin)
  async updateUserRole(userId, role) {
    try {
      const response = await axios.put(
        `${API_URL}/${userId}/role`,
        { role },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Eliminar usuario (Admin)
  async deleteUser(userId) {
    try {
      const response = await axios.delete(
        `${API_URL}/${userId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
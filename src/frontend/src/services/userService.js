import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const userService = {
  // Obtener token del localStorage
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  },

  // Obtener todos los usuarios (con filtros)
  async getAllUsers(search = '', role = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    
    const response = await axios.get(
      `${API_URL}/api/users?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  },

  // Obtener estadísticas
  async getUserStats() {
    const response = await axios.get(
      `${API_URL}/api/users/stats`,
      this.getAuthHeaders()
    );
    return response.data;
  },

  // Obtener usuario específico
  async getUserById(id) {
    const response = await axios.get(
      `${API_URL}/api/users/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  },

  // Actualizar usuario
  async updateUser(id, data) {
    const response = await axios.put(
      `${API_URL}/api/users/${id}`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  },

  // Eliminar usuario
  async deleteUser(id) {
    const response = await axios.delete(
      `${API_URL}/api/users/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  },

  // Activar/Desactivar usuario
  async toggleUserStatus(id) {
    const response = await axios.patch(
      `${API_URL}/api/users/${id}/toggle-status`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }
};

export default userService;
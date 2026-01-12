import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userService } from '@/services/userService';

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const userCount = computed(() => users.value.length);

  const adminUsers = computed(() => 
    users.value.filter(user => user.role === 'admin')
  );

  const regularUsers = computed(() => 
    users.value.filter(user => user.role === 'user')
  );

  const adminCount = computed(() => adminUsers.value.length);
  const regularUserCount = computed(() => regularUsers.value.length);

  // Actions
  async function fetchAllUsers() {
    loading.value = true;
    error.value = null;
    try {
      users.value = await userService.getAllUsers();
    } catch (err) {
      error.value = err.message || 'Error al cargar usuarios';
      console.error('Error fetching users:', err);
    } finally {
      loading.value = false;
    }
  }

  async function updateUserRole(userId, newRole) {
    loading.value = true;
    error.value = null;
    try {
      const updatedUser = await userService.updateUserRole(userId, newRole);
      
      // Actualizar en la lista local
      const index = users.value.findIndex(u => u._id === userId || u.id === userId);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      
      return { success: true, user: updatedUser };
    } catch (err) {
      error.value = err.message || 'Error al actualizar rol';
      console.error('Error updating user role:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function deleteUser(userId) {
    loading.value = true;
    error.value = null;
    try {
      await userService.deleteUser(userId);
      
      // Eliminar de la lista local
      users.value = users.value.filter(u => u._id !== userId && u.id !== userId);
      
      return { success: true };
    } catch (err) {
      error.value = err.message || 'Error al eliminar usuario';
      console.error('Error deleting user:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  function getUserById(userId) {
    return users.value.find(u => u._id === userId || u.id === userId);
  }

  function searchUsers(query) {
    if (!query) return users.value;
    
    const lowerQuery = query.toLowerCase();
    return users.value.filter(user => 
      user.username?.toLowerCase().includes(lowerQuery) ||
      user.email?.toLowerCase().includes(lowerQuery)
    );
  }

  function resetUsers() {
    users.value = [];
    error.value = null;
    loading.value = false;
  }

  return {
    // State
    users,
    loading,
    error,
    
    // Getters
    userCount,
    adminUsers,
    regularUsers,
    adminCount,
    regularUserCount,
    
    // Actions
    fetchAllUsers,
    updateUserRole,
    deleteUser,
    getUserById,
    searchUsers,
    resetUsers
  };
});
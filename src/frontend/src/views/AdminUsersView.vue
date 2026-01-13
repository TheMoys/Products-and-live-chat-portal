<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import userService from '@/services/userService';

const router = useRouter();
const authStore = useAuthStore();

const users = ref([]);
const stats = ref(null);
const loading = ref(false);
const searchQuery = ref('');
const roleFilter = ref('');

// Modal
const showModal = ref(false);
const editingUser = ref(null);
const modalForm = ref({
  username: '',
  email: '',
  role: 'user'
});

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
    const [usersData, statsData] = await Promise.all([
      userService.getAllUsers(searchQuery.value, roleFilter.value),
      userService.getUserStats()
    ]);
    
    users.value = usersData;
    stats.value = statsData;
  } catch (error) {
    console.error('Error cargando datos:', error);
    alert('❌ Error al cargar datos');
  } finally {
    loading.value = false;
  }
}

async function handleSearch() {
  await loadData();
}

async function handleFilterChange() {
  await loadData();
}

function openEditModal(user) {
  editingUser.value = user;
  modalForm.value = {
    username: user.username,
    email: user.email,
    role: user.role
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingUser.value = null;
  modalForm.value = {
    username: '',
    email: '',
    role: 'user'
  };
}

async function handleUpdateUser() {
  if (!editingUser.value) return;
  
  try {
    await userService.updateUser(editingUser.value._id, modalForm.value);
    alert('✅ Usuario actualizado');
    closeModal();
    await loadData();
  } catch (error) {
    alert(error.response?.data?.message || '❌ Error al actualizar usuario');
  }
}

async function handleToggleStatus(userId) {
  if (!confirm('¿Cambiar estado del usuario?')) return;
  
  try {
    await userService.toggleUserStatus(userId);
    alert('✅ Estado actualizado');
    await loadData();
  } catch (error) {
    alert(error.response?.data?.message || '❌ Error al cambiar estado');
  }
}

async function handleDeleteUser(userId, username) {
  if (!confirm(`¿Eliminar usuario "${username}"? Esta acción no se puede deshacer.`)) return;
  
  try {
    await userService.deleteUser(userId);
    alert('✅ Usuario eliminado');
    await loadData();
  } catch (error) {
    alert(error.response?.data?.message || '❌ Error al eliminar usuario');
  }
}

function goBack() {
  router.push('/');
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<template>
  <div class="admin-users-view">
    <div class="admin-container">
      
      <!-- Header -->
      <div class="admin-header">
        <button @click="goBack" class="btn-back">← Volver</button>
        <h1>👥 Gestión de Usuarios</h1>
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
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ stats.total }}</h3>
              <p>Total Usuarios</p>
            </div>
          </div>

          <div class="stat-card admins">
            <div class="stat-icon">🛡️</div>
            <div class="stat-content">
              <h3>{{ stats.admins }}</h3>
              <p>Administradores</p>
            </div>
          </div>

          <div class="stat-card regular">
            <div class="stat-icon">👤</div>
            <div class="stat-content">
              <h3>{{ stats.regularUsers }}</h3>
              <p>Usuarios Regulares</p>
            </div>
          </div>

          <div class="stat-card new">
            <div class="stat-icon">✨</div>
            <div class="stat-content">
              <h3>{{ stats.newUsers }}</h3>
              <p>Nuevos (30 días)</p>
            </div>
          </div>
        </div>

        <!-- Filtros y Búsqueda -->
        <div class="filters">
          <div class="search-box">
            <input 
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text" 
              placeholder="🔍 Buscar por username o email..."
            >
            <button @click="handleSearch" class="btn-search">Buscar</button>
          </div>

          <select v-model="roleFilter" @change="handleFilterChange" class="role-filter">
            <option value="">Todos los roles</option>
            <option value="user">👤 Usuarios</option>
            <option value="admin">🛡️ Administradores</option>
          </select>
        </div>

        <!-- Tabla -->
        <div class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user._id">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>
                    <strong>{{ user.username }}</strong>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="['role-badge', user.role]">
                    {{ user.role === 'admin' ? '🛡️ Admin' : '👤 Usuario' }}
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', user.isActive ? 'active' : 'inactive']">
                    {{ user.isActive ? '✅ Activo' : '❌ Inactivo' }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button @click="openEditModal(user)" class="btn-edit" title="Editar">
                      ✏️
                    </button>
                    <button 
                      @click="handleToggleStatus(user._id)" 
                      class="btn-toggle"
                      :title="user.isActive ? 'Desactivar' : 'Activar'"
                    >
                      {{ user.isActive ? '🔒' : '🔓' }}
                    </button>
                    <button 
                      @click="handleDeleteUser(user._id, user.username)" 
                      class="btn-delete"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="users.length === 0" class="empty-state">
            <p>👥 No se encontraron usuarios</p>
          </div>
        </div>
      </template>

    </div>

    <!-- Modal Editar Usuario -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>✏️ Editar Usuario</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>

        <form @submit.prevent="handleUpdateUser" class="user-form">
          <div class="input-group">
            <label>Username</label>
            <input v-model="modalForm.username" type="text" required>
          </div>

          <div class="input-group">
            <label>Email</label>
            <input v-model="modalForm.email" type="email" required>
          </div>

          <div class="input-group">
            <label>Rol</label>
            <select v-model="modalForm.role" required>
              <option value="user">👤 Usuario</option>
              <option value="admin">🛡️ Administrador</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-submit">💾 Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style src="@/assets/styles/adminUsers.css"></style>
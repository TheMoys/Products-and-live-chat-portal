<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import userService from '../../services/userService.js';
  import { getIsAdmin } from '../state/appState.svelte.js';
  import '@/assets/styles/adminUsers.css';

  let users = $state([]);
  let stats = $state(null);
  let loading = $state(false);
  let error = $state('');

  let searchQuery = $state('');
  let roleFilter = $state('');

  let showModal = $state(false);
  let editingUser = $state(null);
  let saving = $state(false);

  let modalForm = $state({
    username: '',
    email: '',
    role: 'user'
  });

  function goBack() {
    push('/products');
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  async function loadData() {
    loading = true;
    error = '';

    try {
      const [usersData, statsData] = await Promise.all([
        userService.getAllUsers(searchQuery, roleFilter),
        userService.getUserStats()
      ]);

      users = Array.isArray(usersData) ? usersData : [];
      stats = statsData || null;
    } catch (err) {
      error = err?.response?.data?.message || err?.message || 'Error al cargar datos';
    } finally {
      loading = false;
    }
  }

  function openEditModal(user) {
    editingUser = user;
    modalForm = {
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user'
    };
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingUser = null;
    saving = false;
    modalForm = {
      username: '',
      email: '',
      role: 'user'
    };
  }

  async function handleSearch() {
    await loadData();
  }

  async function handleFilterChange() {
    await loadData();
  }

  async function handleUpdateUser(event) {
    event.preventDefault();
    if (!editingUser) return;

    saving = true;
    try {
      await userService.updateUser(editingUser._id || editingUser.id, {
        username: modalForm.username,
        email: modalForm.email,
        role: modalForm.role
      });

      closeModal();
      await loadData();
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      saving = false;
    }
  }

  async function handleToggleStatus(userId) {
    if (!window.confirm('Cambiar estado del usuario?')) return;

    try {
      await userService.toggleUserStatus(userId);
      await loadData();
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Error al cambiar estado');
    }
  }

  async function handleDeleteUser(userId, username) {
    if (!window.confirm(`Eliminar usuario "${username}"? Esta accion no se puede deshacer.`)) return;

    try {
      await userService.deleteUser(userId);
      await loadData();
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Error al eliminar usuario');
    }
  }

  onMount(async () => {
    if (!getIsAdmin()) {
      window.alert('Acceso denegado');
      push('/products');
      return;
    }
    await loadData();
  });
</script>

<div class="admin-users-view">
  <div class="admin-container">
    <div class="admin-header">
      <h1>Gestion de Usuarios</h1>
      <button onclick={goBack} class="btn btn-secondary">Volver</button>
    </div>

    {#if loading && !stats}
      <div class="loading">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>
    {:else}
      {#if error}
        <div class="alert alert-danger">
          <p>{error}</p>
          <button onclick={loadData} class="btn btn-primary btn-small mt-sm">Reintentar</button>
        </div>
      {/if}

      {#if stats}
        <div class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Usuarios</p>
            </div>
          </div>

          <div class="stat-card admins">
            <div class="stat-icon">🛡️</div>
            <div class="stat-content">
              <h3>{stats.admins}</h3>
              <p>Administradores</p>
            </div>
          </div>

          <div class="stat-card users">
            <div class="stat-icon">👤</div>
            <div class="stat-content">
              <h3>{stats.regularUsers}</h3>
              <p>Usuarios Regulares</p>
            </div>
          </div>

          <div class="stat-card new">
            <div class="stat-icon">✨</div>
            <div class="stat-content">
              <h3>{stats.newUsers}</h3>
              <p>Nuevos (30 dias)</p>
            </div>
          </div>
        </div>
      {/if}

      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label for="search">Busqueda</label>
            <input
              id="search"
              class="input-field"
              type="text"
              placeholder="Buscar por username o email..."
              bind:value={searchQuery}
              onkeydown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div class="filter-group">
            <label for="roleFilter">Rol</label>
            <select id="roleFilter" class="input-field" bind:value={roleFilter} onchange={handleFilterChange}>
              <option value="">Todos los roles</option>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button onclick={handleSearch} class="btn btn-primary">Buscar</button>
        </div>
      </div>

      <div class="users-table-container">
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
            {#each users as user}
              <tr>
                <td>
                  <div class="user-info-cell">
                    <div class="user-avatar">{user.username?.charAt(0)?.toUpperCase() || 'U'}</div>
                    <div class="user-details">
                      <div class="user-name">{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span class={['role-badge', user.role].join(' ')}>
                    {user.role === 'admin' ? 'ADMIN' : 'USER'}
                  </span>
                </td>
                <td>
                  <span class={['status-badge', user.isActive ? 'active' : 'inactive'].join(' ')}>
                    {user.isActive ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn edit" onclick={() => openEditModal(user)}>Editar</button>
                    <button
                      class="action-btn toggle"
                      onclick={() => handleToggleStatus(user._id || user.id)}
                      title={user.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {user.isActive ? '🔒' : '🔓'}
                    </button>
                    <button
                      class="action-btn delete"
                      onclick={() => handleDeleteUser(user._id || user.id, user.username)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

        {#if users.length === 0}
          <div class="empty-state">
            <p>No se encontraron usuarios</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if showModal}
    <div class="modal-overlay" onclick={(e) => e.target === e.currentTarget && closeModal()}>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Usuario</h2>
          <button class="modal-close" onclick={closeModal}>×</button>
        </div>

        <form class="modal-form" onsubmit={handleUpdateUser}>
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" class="input-field" type="text" bind:value={modalForm.username} required />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" class="input-field" type="email" bind:value={modalForm.email} required />
          </div>

          <div class="form-group">
            <label for="role">Rol</label>
            <select id="role" class="input-field" bind:value={modalForm.role} required>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick={closeModal} disabled={saving}>Cancelar</button>
            <button type="submit" class="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>
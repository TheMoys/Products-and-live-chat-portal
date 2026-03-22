<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import orderService from '../../services/orderService.js';
  import { getIsAdmin } from '../state/appState.svelte.js';
  import '@/assets/styles/adminOrders.css';

  let orders = $state([]);
  let stats = $state(null);
  let loading = $state(false);
  let filterStatus = $state('');
  let error = $state('');

  const statusOptions = [
    { value: 'pending', label: 'Pendiente', color: '#ffc107' },
    { value: 'processing', label: 'Procesando', color: '#17a2b8' },
    { value: 'shipped', label: 'Enviado', color: '#28a745' },
    { value: 'delivered', label: 'Entregado', color: '#28a745' },
    { value: 'cancelled', label: 'Cancelado', color: '#dc3545' }
  ];

  function goBack() {
    push('/products');
  }

  function viewDetail(orderId) {
    push(`/orders/${orderId}`);
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(Number(price || 0));
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status) {
    return statusOptions.find((s) => s.value === status)?.color || '#6c757d';
  }

  async function loadData() {
    loading = true;
    error = '';

    try {
      const [ordersData, statsData] = await Promise.all([
        orderService.getAllOrders(filterStatus || null),
        orderService.getOrderStats()
      ]);

      orders = Array.isArray(ordersData) ? ordersData : [];
      stats = statsData || null;
    } catch (err) {
      error = err?.message || 'Error al cargar datos de pedidos';
    } finally {
      loading = false;
    }
  }

  async function changeStatus(orderId, newStatus) {
    if (!window.confirm(`Cambiar estado a "${newStatus}"?`)) return;

    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err) {
      window.alert(err?.message || 'Error al actualizar estado');
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

<div class="admin-orders-view">
  <div class="admin-container">
    <div class="admin-header">
      <h1>Gestion de Pedidos</h1>
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
          <button class="btn btn-primary btn-small mt-sm" onclick={loadData}>Reintentar</button>
        </div>
      {/if}

      {#if stats}
        <div class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Pedidos</p>
            </div>
          </div>

          <div class="stat-card revenue">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3>{formatPrice(stats.totalRevenue)}</h3>
              <p>Ingresos</p>
            </div>
          </div>

          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pendientes</p>
            </div>
          </div>

          <div class="stat-card processing">
            <div class="stat-icon">⚙️</div>
            <div class="stat-content">
              <h3>{stats.processing}</h3>
              <p>Procesando</p>
            </div>
          </div>

          <div class="stat-card shipped">
            <div class="stat-icon">🚚</div>
            <div class="stat-content">
              <h3>{stats.shipped}</h3>
              <p>Enviados</p>
            </div>
          </div>

          <div class="stat-card delivered">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>{stats.delivered}</h3>
              <p>Entregados</p>
            </div>
          </div>
        </div>
      {/if}

      <div class="filters-section">
        <div class="filter-group">
          <label for="statusFilter">Filtrar por estado</label>
          <select
            id="statusFilter"
            class="input-field"
            bind:value={filterStatus}
            onchange={loadData}
          >
            <option value="">Todos</option>
            {#each statusOptions as status}
              <option value={status.value}>{status.label}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="orders-table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {#each orders as order}
              <tr>
                <td><strong>{order.orderNumber}</strong></td>
                <td>
                  <div class="customer-info">
                    <strong>{order.user?.username || 'N/A'}</strong>
                    <small>{order.user?.email || ''}</small>
                  </div>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.items?.length || 0}</td>
                <td><strong>{formatPrice(order.totalAmount)}</strong></td>
                <td>
                  <select
                    class="status-select"
                    value={order.status}
                    style:border-color={getStatusColor(order.status)}
                    onchange={(e) => changeStatus(order.id || order._id, e.currentTarget.value)}
                  >
                    {#each statusOptions as status}
                      <option value={status.value}>{status.label}</option>
                    {/each}
                  </select>
                </td>
                <td>
                  <button class="btn btn-primary btn-small" onclick={() => viewDetail(order.id || order._id)}>
                    Ver
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

        {#if orders.length === 0}
          <div class="empty-state">
            <p>No hay pedidos</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
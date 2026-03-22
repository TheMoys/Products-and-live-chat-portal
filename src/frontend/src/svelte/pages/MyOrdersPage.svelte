<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import orderService from '../../services/orderService.js';
  import '@/assets/styles/myOrders.css';

  let orders = $state([]);
  let loading = $state(true);
  let error = $state('');

  function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(Number(price || 0));
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusBadge(status) {
    const badges = {
      pending: { text: 'Pendiente', class: 'status-pending', icon: '⏳' },
      processing: { text: 'Procesando', class: 'status-processing', icon: '⚙️' },
      shipped: { text: 'Enviado', class: 'status-shipped', icon: '🚚' },
      delivered: { text: 'Entregado', class: 'status-delivered', icon: '✅' },
      cancelled: { text: 'Cancelado', class: 'status-cancelled', icon: '❌' }
    };
    return badges[status] || badges.pending;
  }

  function orderCount() {
    return orders.length;
  }

  function pendingOrdersCount() {
    return orders.filter((order) => order.status === 'pending').length;
  }

  function completedOrdersCount() {
    return orders.filter((order) => order.status === 'delivered').length;
  }

  function hasOrders() {
    return orders.length > 0;
  }

  async function fetchMyOrders() {
    loading = true;
    error = '';

    try {
      orders = await orderService.getMyOrders();
    } catch (err) {
      error = err?.message || 'Error al cargar pedidos';
    } finally {
      loading = false;
    }
  }

  function goBack() {
    push('/products');
  }

  function goToProducts() {
    push('/products');
  }

  function viewOrderDetail(orderId) {
    push(`/orders/${orderId}`);
  }

  function itemImage(item) {
    return item?.product?.imageData || item?.product?.imageUrl || 'https://via.placeholder.com/50';
  }

  onMount(fetchMyOrders);
</script>

<div class="my-orders-view">
  <div class="orders-container">
    <div class="orders-header">
      <div>
        <h1 class="page-title">Mis Pedidos</h1>
        <p class="subtitle text-secondary">Historial de todas tus compras</p>
      </div>
      <button onclick={goBack} class="btn btn-secondary">Volver</button>
    </div>

    {#if loading}
      <div class="flex-center flex-col gap-md" style="min-height: 400px;">
        <div class="spinner"></div>
        <p class="text-secondary">Cargando pedidos...</p>
      </div>
    {:else if error}
      <div class="alert alert-danger">
        <p>{error}</p>
        <button onclick={fetchMyOrders} class="btn btn-primary btn-small mt-sm">Reintentar</button>
      </div>
    {:else if !hasOrders()}
      <div class="card text-center p-lg">
        <div style="font-size: 80px; margin-bottom: var(--spacing-md);">📦</div>
        <h2 class="section-title mb-sm">No tienes pedidos aún</h2>
        <p class="text-secondary mb-md">Explora nuestros productos y haz tu primera compra</p>
        <button onclick={goToProducts} class="btn btn-primary">Ir a Productos</button>
      </div>
    {:else}
      <div class="orders-list">
        <div class="orders-stats">
          <div class="stat-card">
            <span class="stat-number">{orderCount()}</span>
            <span class="stat-label">Total Pedidos</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{pendingOrdersCount()}</span>
            <span class="stat-label">⏳ Pendientes</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{completedOrdersCount()}</span>
            <span class="stat-label">✅ Completados</span>
          </div>
        </div>

        {#each orders as order}
          <div class="order-card">
            <div class="order-header">
              <div class="order-info">
                <h3>Pedido #{order.orderNumber}</h3>
                <p class="order-date">{formatDate(order.createdAt)}</p>
              </div>

              <div class="order-status">
                {#key order.status}
                  <span class={['status-badge', getStatusBadge(order.status).class].join(' ')}>
                    {getStatusBadge(order.status).icon} {getStatusBadge(order.status).text}
                  </span>
                {/key}
              </div>
            </div>

            <div class="order-items">
              {#each order.items.slice(0, 3) as item}
                <div class="order-item">
                  <div class="item-image">
                    <img src={itemImage(item)} alt={item.title} />
                  </div>
                  <div class="item-details">
                    <p class="item-title">{item.title}</p>
                    <p class="item-quantity">Cantidad: {item.quantity}</p>
                  </div>
                  <div class="item-price">
                    {formatPrice(Number(item.price) * Number(item.quantity))}
                  </div>
                </div>
              {/each}

              {#if order.items.length > 3}
                <p class="more-items">+{order.items.length - 3} productos más</p>
              {/if}
            </div>

            <div class="order-footer">
              <div class="order-total">
                <span>Total:</span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>
              <button onclick={() => viewOrderDetail(order.id)} class="btn-details">
                Ver Detalles →
              </button>
            </div>

            {#if order.shippingAddress}
              <div class="order-shipping">
                <p class="shipping-label">📍 Enviar a:</p>
                <p class="shipping-address">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}
                  {order.shippingAddress.zipCode}
                </p>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
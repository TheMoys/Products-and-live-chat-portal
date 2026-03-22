<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import orderService from '../../services/orderService.js';
  import '@/assets/styles/orderDetails.css';

  export let params = {};

  let currentOrder = $state(null);
  let loading = $state(true);
  let error = $state('');

  function orderId() {
    return params?.id;
  }

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

  function getStatusInfo(status) {
    const statuses = {
      pending: {
        text: 'Pendiente',
        icon: '⏳',
        description: 'Tu pedido está siendo procesado'
      },
      processing: {
        text: 'Procesando',
        icon: '⚙️',
        description: 'Estamos preparando tu pedido'
      },
      shipped: {
        text: 'Enviado',
        icon: '🚚',
        description: 'Tu pedido está en camino'
      },
      delivered: {
        text: 'Entregado',
        icon: '✅',
        description: 'Pedido entregado exitosamente'
      },
      cancelled: {
        text: 'Cancelado',
        icon: '❌',
        description: 'Este pedido ha sido cancelado'
      }
    };
    return statuses[status] || statuses.pending;
  }

  function getProductImage(product) {
    if (product?.imageData) return product.imageData;
    if (product?.imageUrl) return product.imageUrl;
    return 'https://via.placeholder.com/150?text=Sin+Imagen';
  }

  async function fetchOrderDetail() {
    loading = true;
    error = '';

    try {
      currentOrder = await orderService.getOrderDetail(orderId());
    } catch (err) {
      error = err?.message || 'Error al cargar detalle del pedido';
    } finally {
      loading = false;
    }
  }

  function goBack() {
    push('/my-orders');
  }

  function goSupport() {
    push('/chat');
  }

  onMount(fetchOrderDetail);
</script>

<div class="order-detail-view">
  <div class="detail-container">
    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Cargando detalles del pedido...</p>
      </div>
    {:else if error}
      <div class="alert alert-danger">
        <p>{error}</p>
        <div class="flex gap-sm mt-sm">
          <button onclick={fetchOrderDetail} class="btn btn-primary btn-small">Reintentar</button>
          <button onclick={goBack} class="btn btn-secondary btn-small">Volver</button>
        </div>
      </div>
    {:else if currentOrder}
      <div class="order-detail">
        <div class="detail-header">
          <button onclick={goBack} class="btn btn-secondary">Volver</button>
        </div>

        <div class="order-info-card">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ID de Pedido</span>
              <span class="info-value order-id">{currentOrder.orderNumber}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Pedido</span>
              <span class="info-value">{formatDate(currentOrder.createdAt)}</span>
            </div>
            {#if currentOrder.user}
              <div class="info-item">
                <span class="info-label">Cliente</span>
                <span class="info-value">{currentOrder.user.username}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{currentOrder.user.email}</span>
              </div>
            {/if}
          </div>
        </div>

        <div class="status-section">
          <h2>Estado del Pedido</h2>
          <div class="status-timeline">
            {#each ['pending', 'processing', 'shipped', 'delivered'] as status}
              <div class="timeline-item">
                <div class={['timeline-dot', currentOrder.status === status ? 'active' : ''].join(' ')}></div>
                <div class="timeline-content">
                  <div class="timeline-status">
                    {getStatusInfo(status).icon} {getStatusInfo(status).text}
                  </div>
                  {#if currentOrder.status === status}
                    <div class="timeline-date">{getStatusInfo(status).description}</div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>

        {#if currentOrder.shippingAddress}
          <div class="order-info-card">
            <h2 style="margin: 0 0 var(--spacing-md) 0;">Dirección de Envío</h2>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <p style="margin: 0;"><strong>{currentOrder.shippingAddress.street}</strong></p>
              <p style="margin: 0;">{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}</p>
              <p style="margin: 0;">CP: {currentOrder.shippingAddress.zipCode}</p>
              <p style="margin: 0;">{currentOrder.shippingAddress.country}</p>
            </div>
          </div>
        {/if}

        <div class="products-section">
          <h2>Productos ({currentOrder.items.length})</h2>

          <div class="products-list">
            {#each currentOrder.items as item}
              <div class="product-item">
                <img src={getProductImage(item.product)} alt={item.title} class="product-image" />

                <div class="product-info">
                  <div class="product-name">{item.title}</div>
                  <div class="product-description">{item.product?.description || 'Producto'}</div>
                </div>

                <div class="product-quantity">x {item.quantity}</div>

                <div class="product-price">
                  {formatPrice(Number(item.price) * Number(item.quantity))}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="summary-section">
          <h2>Resumen de Pago</h2>
          <div>
            <div class="summary-row">
              <span class="summary-label">Subtotal ({currentOrder.items.length} items)</span>
              <span class="summary-value">{formatPrice(currentOrder.totalAmount)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Envío</span>
              <span class="summary-value" style="color: var(--steam-green);">GRATIS 🎉</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total</span>
              <span class="summary-value">{formatPrice(currentOrder.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div class="help-section">
          <p>¿Tienes algún problema con tu pedido?</p>
          <button class="btn-help" onclick={goSupport}>Contactar Soporte</button>
        </div>
      </div>
    {/if}
  </div>
</div>
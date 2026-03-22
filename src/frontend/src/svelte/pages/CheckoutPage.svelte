<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import cartService from '../../services/cartService.js';
  import orderService from '../../services/orderService.js';
  import '@/assets/styles/checkout.css';

  let cart = $state(null);
  let loading = $state(true);
  let submitting = $state(false);
  let error = $state('');
  let formErrors = $state({});

  let form = $state({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(Number(price || 0));
  }

  function getItems() {
    return cart?.items || [];
  }

  function isEmpty() {
    return getItems().length === 0;
  }

  function totalAmount() {
    return getItems().reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }

  function getProductImage(product) {
    return (
      product?.imageData ||
      product?.imageUrl ||
      product?.image ||
      'https://via.placeholder.com/80?text=Sin+Imagen'
    );
  }

  async function fetchCart() {
    loading = true;
    error = '';
    try {
      cart = await cartService.getCart();
    } catch (err) {
      error = err?.message || 'Error al cargar carrito';
    } finally {
      loading = false;
    }
  }

  function validateForm() {
    formErrors = {};

    if (!form.street.trim()) formErrors.street = 'La dirección es requerida';
    if (!form.city.trim()) formErrors.city = 'La ciudad es requerida';
    if (!form.state.trim()) formErrors.state = 'El estado es requerido';

    if (!form.zipCode.trim()) {
      formErrors.zipCode = 'El código postal es requerido';
    } else if (!/^\d{5}$/.test(form.zipCode)) {
      formErrors.zipCode = 'El código postal debe tener 5 dígitos';
    }

    if (!form.country.trim()) formErrors.country = 'El país es requerido';

    return Object.keys(formErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    error = '';

    if (!validateForm()) return;
    if (isEmpty()) {
      error = 'El carrito está vacío';
      return;
    }

    submitting = true;
    try {
      await orderService.createOrder({
        street: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country
      });

      await fetchCart();
      push('/products');
    } catch (err) {
      error = err?.message || 'Error al crear el pedido';
    } finally {
      submitting = false;
    }
  }

  function handleCancel() {
    push('/cart');
  }

  onMount(fetchCart);
</script>

<div class="checkout-view">
  <div class="checkout-container">
    <div class="checkout-header">
      <h1 class="page-title">Finalizar Compra</h1>
      <button onclick={handleCancel} class="btn btn-secondary">Volver</button>
    </div>

    {#if loading}
      <div class="flex-center flex-col gap-md" style="min-height: 400px;">
        <div class="spinner"></div>
        <p class="text-secondary">Cargando información...</p>
      </div>
    {:else if isEmpty()}
      <div class="card text-center p-lg">
        <div style="font-size: 80px; margin-bottom: var(--spacing-md);">🛒</div>
        <h2 class="section-title mb-sm">Tu carrito está vacío</h2>
        <p class="text-secondary mb-md">Agrega productos antes de hacer checkout</p>
        <button onclick={() => push('/products')} class="btn btn-primary">Ir a Productos</button>
      </div>
    {:else}
      <div class="checkout-content">
        <div class="checkout-form card">
          <h2 class="section-title">Dirección de Envío</h2>

          <form onsubmit={handleSubmit}>
            <div class="form-row">
              <div class="input-group" class:error={Boolean(formErrors.street)}>
                <label for="street">Dirección *</label>
                <input
                  id="street"
                  class="input-field"
                  type="text"
                  placeholder="Calle, número, colonia"
                  bind:value={form.street}
                  disabled={submitting}
                />
                {#if formErrors.street}
                  <span class="error-message">{formErrors.street}</span>
                {/if}
              </div>
            </div>

            <div class="form-row">
              <div class="input-group" class:error={Boolean(formErrors.city)}>
                <label for="city">Ciudad *</label>
                <input id="city" class="input-field" type="text" bind:value={form.city} disabled={submitting} />
                {#if formErrors.city}
                  <span class="error-message">{formErrors.city}</span>
                {/if}
              </div>

              <div class="input-group" class:error={Boolean(formErrors.state)}>
                <label for="state">Estado *</label>
                <input id="state" class="input-field" type="text" bind:value={form.state} disabled={submitting} />
                {#if formErrors.state}
                  <span class="error-message">{formErrors.state}</span>
                {/if}
              </div>
            </div>

            <div class="form-row">
              <div class="input-group" class:error={Boolean(formErrors.zipCode)}>
                <label for="zipCode">Código Postal *</label>
                <input
                  id="zipCode"
                  class="input-field"
                  type="text"
                  maxlength="5"
                  bind:value={form.zipCode}
                  disabled={submitting}
                />
                {#if formErrors.zipCode}
                  <span class="error-message">{formErrors.zipCode}</span>
                {/if}
              </div>

              <div class="input-group" class:error={Boolean(formErrors.country)}>
                <label for="country">País *</label>
                <input
                  id="country"
                  class="input-field"
                  type="text"
                  bind:value={form.country}
                  disabled={submitting}
                />
                {#if formErrors.country}
                  <span class="error-message">{formErrors.country}</span>
                {/if}
              </div>
            </div>

            {#if error}
              <div class="alert alert-danger">{error}</div>
            {/if}

            <div class="form-actions">
              <button type="button" onclick={handleCancel} class="btn btn-secondary" disabled={submitting}>
                Cancelar
              </button>
              <button type="submit" class="btn btn-success btn-large" disabled={submitting}>
                {#if submitting}Procesando...{:else}Confirmar Pedido{/if}
              </button>
            </div>
          </form>
        </div>

        <div class="order-summary card">
          <h2 class="section-title">Resumen del Pedido</h2>

          <div class="summary-items">
            {#each getItems() as item}
              <div class="summary-item">
                <img src={getProductImage(item.product)} alt={item.product?.title || 'Producto'} />
                <div class="summary-item-info">
                  <h4>{item.product?.title}</h4>
                  <p>Cantidad: {item.quantity}</p>
                  <p class="item-price">{formatPrice(Number(item.price) * Number(item.quantity))}</p>
                </div>
              </div>
            {/each}
          </div>

          <div class="summary-divider"></div>

          <div class="summary-total">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(totalAmount())}</span>
            </div>
            <div class="summary-row">
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>{formatPrice(totalAmount())}</span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import cartService from '../../services/cartService.js';
  import '@/assets/styles/cart.css';

  let cart = $state(null);
  let loading = $state(true);
  let error = $state('');

  function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(Number(price || 0));
  }

  function getProductId(product) {
    return product?.id || product?._id;
  }

  function getProductImage(product) {
    return (
      product?.imageData ||
      product?.imageUrl ||
      product?.image ||
      'https://via.placeholder.com/150?text=Sin+Imagen'
    );
  }

  function getItems() {
    return cart?.items || [];
  }

  function itemCount() {
    return getItems().reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  function totalAmount() {
    return getItems().reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }

  function isEmpty() {
    return getItems().length === 0;
  }

  async function fetchCart() {
    loading = true;
    error = '';
    try {
      cart = await cartService.getCart();
    } catch (err) {
      error = err?.message || 'Error al cargar el carrito';
    } finally {
      loading = false;
    }
  }

  async function handleUpdateQuantity(product, newQuantity) {
    const productId = getProductId(product);
    const stock = Number(product?.stock || 0);

    if (!productId) return;
    if (newQuantity < 1) return;
    if (stock > 0 && newQuantity > stock) return;

    loading = true;
    error = '';
    try {
      cart = await cartService.updateCartItem(productId, newQuantity);
    } catch (err) {
      error = err?.message || 'Error al actualizar cantidad';
    } finally {
      loading = false;
    }
  }

  async function handleRemoveItem(product) {
    const productId = getProductId(product);
    if (!productId) return;

    const ok = window.confirm('¿Eliminar este producto del carrito?');
    if (!ok) return;

    loading = true;
    error = '';
    try {
      cart = await cartService.removeFromCart(productId);
    } catch (err) {
      error = err?.message || 'Error al eliminar producto';
    } finally {
      loading = false;
    }
  }

  async function handleClearCart() {
    const ok = window.confirm('¿Vaciar todo el carrito?');
    if (!ok) return;

    loading = true;
    error = '';
    try {
      cart = await cartService.clearCart();
    } catch (err) {
      error = err?.message || 'Error al vaciar carrito';
    } finally {
      loading = false;
    }
  }

  function goToCheckout() {
    push('/checkout');
  }

  function goToProducts() {
    push('/products');
  }

  onMount(fetchCart);
</script>

<div class="cart-view">
  <div class="cart-container">
    <div class="flex-between mb-lg">
      <h1 class="page-title">Mi Carrito</h1>
      {#if !isEmpty()}
        <button onclick={handleClearCart} class="btn btn-danger btn-small">
          Vaciar
        </button>
      {/if}
    </div>

    {#if loading}
      <div class="flex-center flex-col gap-md" style="min-height: 400px;">
        <div class="spinner"></div>
        <p class="text-secondary">Cargando carrito...</p>
      </div>
    {:else if error}
      <div class="alert alert-danger">
        <p>{error}</p>
        <button onclick={fetchCart} class="btn btn-primary btn-small mt-sm">Reintentar</button>
      </div>
    {:else if isEmpty()}
      <div class="card text-center p-lg">
        <div style="font-size: 80px; margin-bottom: var(--spacing-md);">🛒</div>
        <h2 class="section-title mb-sm">Tu carrito está vacío</h2>
        <p class="text-secondary mb-md">Agrega productos para comenzar tu compra</p>
        <button onclick={goToProducts} class="btn btn-primary">Ir a Productos</button>
      </div>
    {:else}
      <div class="cart-content">
        <div class="cart-items">
          {#each getItems() as item}
            <div class="card cart-item">
              <div class="item-image">
                <img src={getProductImage(item.product)} alt={item.product?.title || 'Producto'} />
              </div>

              <div class="item-details">
                <h3 class="item-title">{item.product?.title}</h3>
                <p class="text-secondary item-description">{item.product?.description}</p>
              </div>

              <div class="item-quantity">
                <button
                  class="btn btn-outline btn-small qty-btn"
                  onclick={() => handleUpdateQuantity(item.product, Number(item.quantity) - 1)}
                  disabled={Number(item.quantity) <= 1}
                >
                  -
                </button>

                <input
                  class="input-field qty-input"
                  type="number"
                  min="1"
                  max={item.product?.stock || 9999}
                  value={item.quantity}
                  onchange={(e) => handleUpdateQuantity(item.product, Number(e.currentTarget.value))}
                />

                <button
                  class="btn btn-outline btn-small qty-btn"
                  onclick={() => handleUpdateQuantity(item.product, Number(item.quantity) + 1)}
                  disabled={Number(item.quantity) >= Number(item.product?.stock || 0)}
                >
                  +
                </button>
              </div>

              <div class="item-price">
                <p class="text-muted">{formatPrice(item.price)} c/u</p>
                <p class="price-total">{formatPrice(Number(item.price) * Number(item.quantity))}</p>
              </div>

              <button
                class="btn btn-danger btn-small"
                title="Eliminar"
                onclick={() => handleRemoveItem(item.product)}
              >
                🗑️
              </button>
            </div>
          {/each}
        </div>

        <div class="cart-summary">
          <div class="card">
            <h2 class="section-title mb-md">Resumen de Compra</h2>

            <div class="summary-row">
              <span>Subtotal ({itemCount()} items)</span>
              <span>{formatPrice(totalAmount())}</span>
            </div>

            <div class="summary-row">
              <span>Envío</span>
              <span class="free-shipping">GRATIS</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row summary-total">
              <span>Total</span>
              <span>{formatPrice(totalAmount())}</span>
            </div>

            <button
              class="btn btn-success btn-large mt-md"
              style="width: 100%;"
              onclick={goToCheckout}
              disabled={isEmpty()}
            >
              Proceder al Pago
            </button>

            <button
              class="btn btn-outline mt-sm"
              style="width: 100%; text-align: center; display: block; padding: 12px;"
              onclick={goToProducts}
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
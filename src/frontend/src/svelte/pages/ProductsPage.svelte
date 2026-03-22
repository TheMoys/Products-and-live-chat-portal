<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { productService } from '../../services/productService.js';
  import  cartService  from '../../services/cartService.js';
  import { appState, getIsAdmin } from '../state/appState.svelte.js';
  import '@/assets/styles/products.css';

  let products = $state([]);
  let loading = $state(true);
  let error = $state('');
  let searchQuery = $state('');
  let minPrice = $state('');
  let maxPrice = $state('');

  // Modal state
  let showModal = $state(false);
  let editingProduct = $state(null);
  let imageMode = $state('upload');
  let imagePreview = $state(null);
  let imageError = $state(false);
  let formError = $state('');
  let formLoading = $state(false);

  let form = $state({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    imageData: ''
  });

  // Derived: filtro de productos
  const filteredProducts = $derived.by(() => {
    const query = searchQuery.trim().toLowerCase();
    const min = Number(minPrice || 0);
    const max = Number(maxPrice || Number.MAX_SAFE_INTEGER);

    return products.filter((p) => {
      const titleMatch = p.title.toLowerCase().includes(query);
      const descriptionMatch = (p.description || '').toLowerCase().includes(query);
      const priceMatch = Number(p.price) >= min && Number(p.price) <= max;

      return (titleMatch || descriptionMatch) && priceMatch;
    });
  });

  function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(Number(price || 0));
  }

  function getProductImage(product) {
    if (product?.imageData) return product.imageData;
    if (product?.imageUrl) return product.imageUrl;
    return 'https://via.placeholder.com/280?text=Sin+Imagen';
  }

  function getStockStatus(stock) {
    if (stock === 0) return { text: 'SIN STOCK', class: 'out-of-stock' };
    if (stock <= 5) return { text: 'POCO STOCK', class: 'low-stock' };
    return { text: 'DISPONIBLE', class: 'in-stock' };
  }

  async function fetchProducts() {
  loading = true;
  error = '';

  try {
    const response = await productService.getAllProducts();
    products = Array.isArray(response) ? response : response?.products || [];
  } catch (err) {
    error = err?.message || 'Error al cargar productos';
  } finally {
    loading = false;
  }
}

  async function addToCart(product) {
    try {
      await cartService.addToCart(product._id || product.id, 1);
      alert(`"${product.title}" agregado al carrito`);
    } catch (err) {
      alert('Error al agregar al carrito: ' + (err?.message || 'Error'));
    }
  }

  function openModal(product = null) {
    if (product) {
      editingProduct = product;
      form = {
        title: product.title,
        description: product.description || '',
        price: Number(product.price),
        stock: Number(product.stock),
        imageUrl: product.imageUrl || '',
        imageData: product.imageData || ''
      };

      if (product.imageData) {
        imageMode = 'upload';
        imagePreview = product.imageData;
      } else if (product.imageUrl) {
        imageMode = 'url';
      }
    } else {
      editingProduct = null;
      form = {
        title: '',
        description: '',
        price: 0,
        stock: 0,
        imageUrl: '',
        imageData: ''
      };
      imagePreview = null;
    }

    showModal = true;
    formError = '';
    imageError = false;
  }

  function closeModal() {
    showModal = false;
    editingProduct = null;
    formError = '';
    imagePreview = null;
  }

  function handleFileChange(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.currentTarget.result;
      form.imageData = base64;
      form.imageUrl = '';
      imagePreview = base64;
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    formError = '';

    if (!form.title.trim()) {
      formError = 'El título es requerido';
      return;
    }

    if (form.price < 0) {
      formError = 'El precio no puede ser negativo';
      return;
    }

    if (form.stock < 0) {
      formError = 'El stock no puede ser negativo';
      return;
    }

    formLoading = true;

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id || editingProduct.id, form);
      } else {
        await productService.createProduct(form);
      }
      await fetchProducts();
      closeModal();
    } catch (err) {
      formError = err?.response?.data?.message || 'Error al guardar producto';
    } finally {
      formLoading = false;
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`¿Estás seguro de eliminar "${product.title}"?`)) return;

    try {
      await productService.deleteProduct(product._id || product.id);
      await fetchProducts();
    } catch (err) {
      alert('Error al eliminar producto');
    }
  }

  function goToCart() {
    push('/cart');
  }

  function goToMyOrders() {
    push('/my-orders');
  }

  function goToAdmin() {
    push('/admin/users');
  }

  onMount(fetchProducts);
</script>

<div class="products-container">
  <header class="products-header">
    <h1>PRODUCTOS</h1>
    <div class="header-actions">
      {#if !getIsAdmin()}
        <button onclick={goToMyOrders} class="btn btn-secondary">Mis Pedidos</button>
        <button onclick={goToCart} class="btn btn-primary">Carrito</button>
      {:else}
        <button onclick={goToAdmin} class="btn btn-secondary">Admin Usuarios</button>
        <button onclick={() => openModal()} class="btn btn-success">+ Agregar Producto</button>
      {/if}
    </div>
  </header>

  {#if loading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p class="text-secondary">Cargando productos...</p>
    </div>
  {:else if error}
    <div class="alert alert-danger">
      <p>{error}</p>
      <button onclick={fetchProducts} class="btn btn-primary btn-small mt-sm">Reintentar</button>
    </div>
  {:else}
    <div class="products-search">
      <div class="search-row">
        <input
          type="text"
          placeholder="Buscar productos..."
          bind:value={searchQuery}
          class="input-field"
        />
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <label>Precio mínimo</label>
          <input type="number" bind:value={minPrice} min="0" step="0.01" class="input-field" />
        </div>
        <div class="filter-group">
          <label>Precio máximo</label>
          <input type="number" bind:value={maxPrice} min="0" step="0.01" class="input-field" />
        </div>
        <button
          onclick={() => {
            searchQuery = '';
            minPrice = '';
            maxPrice = '';
          }}
          class="btn btn-outline"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    {#if filteredProducts.length === 0}
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3 class="empty-state-text">
          {searchQuery || minPrice || maxPrice
            ? 'No hay productos que coincidan'
            : 'No hay productos'}
        </h3>
        {#if getIsAdmin() && !searchQuery && !minPrice && !maxPrice}
          <p class="text-secondary">Agrega tu primer producto para comenzar</p>
        {/if}
      </div>
    {:else}
      <div class="products-grid">
        {#each filteredProducts as product}
          <div class="product-card">
            <div class="product-image-container">
              <span class={['stock-badge', getStockStatus(product.stock).class].join(' ')}>
                {getStockStatus(product.stock).text}
              </span>

              <img src={getProductImage(product)} alt={product.title} class="product-image" />
            </div>

            <div class="product-content">
              <h3 class="product-name">{product.title}</h3>
              <p class="product-description">{product.description || 'Sin descripción'}</p>

              <div class="product-meta">
                <span class="product-price">{formatPrice(product.price)}</span>
                <span class="product-stock">Stock: {product.stock}</span>
              </div>

              <div class="product-actions">
                {#if !getIsAdmin()}
                  <button
                    onclick={() => addToCart(product)}
                    class="btn btn-primary btn-full"
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                  </button>
                {:else}
                  <button onclick={() => openModal(product)} class="btn btn-warning btn-small">
                    Editar
                  </button>
                  <button onclick={() => handleDelete(product)} class="btn btn-danger btn-small">
                    Eliminar
                  </button>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

{#if showModal}
  <div class="modal-overlay" onclick={(e) => e.target === e.currentTarget && closeModal()}>
    <div class="modal-content">
      <div class="modal-header">
        <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <button class="modal-close" onclick={closeModal}>×</button>
      </div>

      <form onsubmit={handleSubmit} class="product-form">
        <div class="form-group">
          <label>Imagen del Producto</label>
          <div class="image-mode-buttons">
            <button
              type="button"
              class={['btn', 'btn-small', imageMode === 'upload' ? 'btn-primary' : 'btn-outline'].join(
                ' '
              )}
              onclick={() => (imageMode = 'upload')}
            >
              Subir Archivo
            </button>
            <button
              type="button"
              class={['btn', 'btn-small', imageMode === 'url' ? 'btn-primary' : 'btn-outline'].join(' ')}
              onclick={() => (imageMode = 'url')}
            >
              URL Externa
            </button>
          </div>

          {#if imageMode === 'upload'}
            <input
              type="file"
              accept="image/*"
              onchange={handleFileChange}
              style="display: none"
              id="fileInput"
            />
            <button type="button" class="btn btn-outline btn-full" onclick={() => document.getElementById('fileInput').click()}>
              {imagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
            </button>
            {#if imagePreview}
              <img src={imagePreview} alt="Preview" class="image-preview" />
            {/if}
          {:else}
            <input
              type="url"
              bind:value={form.imageUrl}
              placeholder="https://ejemplo.com/imagen.jpg"
              class="input-field"
            />
            {#if form.imageUrl && !imageError}
              <img
                src={form.imageUrl}
                alt="Preview"
                class="image-preview"
                onerror={() => (imageError = true)}
              />
            {:else if imageError}
              <p class="alert alert-warning">URL inválida o imagen no disponible</p>
            {/if}
          {/if}
        </div>

        <div class="form-group">
          <label for="title">Título del Producto *</label>
          <input
            type="text"
            id="title"
            bind:value={form.title}
            placeholder="Ej: Cyberpunk 2077"
            class="input-field"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea
            id="description"
            bind:value={form.description}
            placeholder="Descripción del producto..."
            class="input-field"
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="price">Precio ($) *</label>
          <input
            type="number"
            id="price"
            bind:value={form.price}
            placeholder="0.00"
            step="0.01"
            min="0"
            class="input-field"
            required
          />
        </div>

        <div class="form-group">
          <label for="stock">Stock *</label>
          <input
            type="number"
            id="stock"
            bind:value={form.stock}
            placeholder="0"
            min="0"
            class="input-field"
            required
          />
        </div>

        {#if formError}
          <div class="alert alert-danger">{formError}</div>
        {/if}

        <div class="form-actions">
          <button type="button" onclick={closeModal} class="btn btn-secondary" disabled={formLoading}>
            Cancelar
          </button>
          <button type="submit" class="btn btn-success" disabled={formLoading}>
            {formLoading ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .products-container {
    min-height: 100vh;
    background: var(--gradient-bg);
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .products-header {
    background: var(--card-bg);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow-md);
  }

  .products-header h1 {
    font-family: var(--font-display);
    font-size: 28px;
    color: var(--text-bright);
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  .products-search {
    background: var(--card-bg);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
    box-shadow: var(--shadow-md);
  }

  .search-row {
    display: flex;
    gap: var(--spacing-sm);
  }

  .search-row input {
    flex: 1;
  }

  .filter-row {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .filter-group {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .filter-group label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
    max-width: 1400px;
    margin: 0 auto;
  }

  .product-card {
    background: var(--card-bg);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
    display: flex;
    flex-direction: column;
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .product-image-container {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
  }

  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .stock-badge {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    backdrop-filter: blur(10px);
  }

  .stock-badge.in-stock {
    background: rgba(91, 163, 43, 0.9);
    color: white;
  }

  .stock-badge.low-stock {
    background: rgba(251, 191, 36, 0.9);
    color: white;
  }

  .stock-badge.out-of-stock {
    background: rgba(205, 92, 92, 0.9);
    color: white;
  }

  .product-content {
    padding: var(--spacing-md);
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .product-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-bright);
    margin: 0 0 var(--spacing-xs) 0;
  }

  .product-description {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-sm) 0;
    flex: 1;
    line-height: 1.5;
  }

  .product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .product-price {
    font-size: 24px;
    font-weight: 600;
    color: var(--steam-green);
  }

  .product-stock {
    font-size: 12px;
    color: var(--text-muted);
  }

  .product-actions {
    display: flex;
    gap: var(--spacing-xs);
  }

  .btn-full {
    flex: 1;
  }

  .btn-small {
    flex: 1;
    font-size: 12px;
    padding: 8px 12px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--card-bg);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  .modal-header h2 {
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 24px;
    cursor: pointer;
    padding: 0;
  }

  .product-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    color: var(--text-bright);
    font-size: 14px;
    font-weight: 500;
  }

  .image-mode-buttons {
    display: flex;
    gap: var(--spacing-sm);
  }

  .image-mode-buttons .btn {
    flex: 1;
  }

  .image-preview {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: var(--radius-sm);
    background: rgba(0, 0, 0, 0.4);
    padding: var(--spacing-sm);
    border: 1px solid rgba(102, 192, 244, 0.2);
    margin-top: var(--spacing-sm);
  }

  .form-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
  }

  .form-actions .btn {
    flex: 1;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    min-height: 300px;
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-lg);
  }

  .empty-state-icon {
    font-size: 64px;
    margin-bottom: var(--spacing-md);
  }

  .empty-state-text {
    color: var(--text-bright);
  }

  @media (max-width: 768px) {
    .products-header {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .filter-row {
      flex-direction: column;
    }

    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
</style>
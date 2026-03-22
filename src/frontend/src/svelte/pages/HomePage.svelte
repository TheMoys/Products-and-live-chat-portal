<script>
  import { push } from 'svelte-spa-router';
  import { appState, getIsAdmin } from '../state/appState.svelte.js';
  import { logout } from '../services/authService.js';
  import '@/assets/styles/home.css';

  function goTo(path) {
    push(path);
  }

  function handleLogout() {
    logout();
    push('/login');
  }
</script>

<div class="home-container">
  <nav class="navbar">
    <div class="navbar-brand">
      <h1>Arcane Archives</h1>
    </div>

    <div class="navbar-links">
      {#if !getIsAdmin()}
        <button class="btn btn-secondary" onclick={() => goTo('/cart')}>Carrito</button>
      {/if}

      <button class="btn btn-secondary" onclick={() => goTo('/my-orders')}>Mis Pedidos</button>

      {#if getIsAdmin()}
        <button class="btn btn-secondary" onclick={() => goTo('/admin/orders')}>Gestion Pedidos</button>
        <button class="btn btn-secondary" onclick={() => goTo('/admin/users')}>Gestion Usuarios</button>
      {/if}
    </div>

    <div class="user-section">
      <div class="user-info">
        <div class="username">{appState.user?.username}</div>
        <div class="role">{appState.user?.role}</div>
      </div>
      <button class="btn btn-danger btn-small" onclick={handleLogout}>Cerrar Sesion</button>
    </div>
  </nav>

  <div class="home-content">
    <section class="welcome-section">
      <h2>Bienvenido, {appState.user?.username}!</h2>
      <p>Portal de gestion gaming</p>
    </section>

    <div class="navigation-grid">
      <div class="nav-card" onclick={() => goTo('/products')}>
        <div class="nav-card-icon">🎮</div>
        <h3>Productos</h3>
        <p>Explora nuestro catalogo de videojuegos</p>
        {#if getIsAdmin()}
          <span class="admin-badge">Gestion Admin</span>
        {/if}
      </div>

      <div class="nav-card" onclick={() => goTo('/chat')}>
        <div class="nav-card-icon">💬</div>
        <h3>Chat</h3>
        <p>Comunicacion en tiempo real</p>
      </div>
    </div>
  </div>
</div>
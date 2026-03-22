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
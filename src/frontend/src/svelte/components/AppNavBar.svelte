<script>
  import { onMount, onDestroy } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { appState, getIsAdmin } from '../state/appState.svelte.js';
  import { logout } from '../services/authService.js';

  let currentPath = $state('/');

  function readPathFromHash() {
    const hash = window.location.hash || '#/';
    const path = hash.replace(/^#/, '') || '/';
    // Normaliza para evitar vacío
    currentPath = path.startsWith('/') ? path : `/${path}`;
  }

  function isActive(path) {
    return currentPath === path;
  }

  function go(path) {
    push(path);
  }

  function handleLogout() {
    logout();
    push('/login');
  }

  onMount(() => {
    readPathFromHash();
    window.addEventListener('hashchange', readPathFromHash);
  });

  onDestroy(() => {
    window.removeEventListener('hashchange', readPathFromHash);
  });
</script>

<nav class="app-nav">
  <div class="brand" onclick={() => go('/home')}>Arcane Archives</div>

  <div class="links">
    {#if appState.token}
      <button class:active={isActive('/home')} onclick={() => go('/home')}>Home</button>
      <button class:active={isActive('/products')} onclick={() => go('/products')}>Productos</button>
      <button class:active={isActive('/chat')} onclick={() => go('/chat')}>Chat</button>
      <button class:active={isActive('/my-orders')} onclick={() => go('/my-orders')}>Pedidos</button>

      {#if getIsAdmin()}
        <button class:active={isActive('/admin/orders')} onclick={() => go('/admin/orders')}>Admin Pedidos</button>
        <button class:active={isActive('/admin/users')} onclick={() => go('/admin/users')}>Admin Usuarios</button>
      {/if}
    {:else}
      <button class:active={isActive('/login')} onclick={() => go('/login')}>Login</button>
      <button class:active={isActive('/register')} onclick={() => go('/register')}>Registro</button>
    {/if}
  </div>

  <div class="right">
    {#if appState.token}
      {#if !getIsAdmin()}
        <button
          class="icon-btn"
          class:active={isActive('/cart')}
          onclick={() => go('/cart')}
          title="Carrito"
          aria-label="Carrito"
        >
          🛒
        </button>
      {/if}

      <button
        class="icon-btn"
        class:active={isActive('/profile')}
        onclick={() => go('/profile')}
        title="Perfil"
        aria-label="Perfil"
      >
        👤
      </button>

      <span class="user">{appState.user?.username}</span>
      <button class="logout" onclick={handleLogout}>Salir</button>
    {/if}
  </div>
</nav>

<style>
  .app-nav {
    position: sticky;
    top: 0;
    z-index: 60;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 16px;
    min-height: 72px;
    padding: 14px 22px;
    background: linear-gradient(180deg, rgba(9, 14, 30, 0.94), rgba(6, 10, 22, 0.92));
    border-bottom: 1px solid rgba(125, 220, 255, 0.22);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(10px);
  }

  .brand {
    color: #00f3ff;
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: 0.4px;
    cursor: pointer;
    white-space: nowrap;
    text-shadow: 0 0 18px rgba(0, 243, 255, 0.35);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    row-gap: 8px;
    min-width: 0;
  }

  .links button {
    border: 1px solid rgba(0, 243, 255, 0.34);
    background: rgba(14, 28, 46, 0.55);
    color: #d9f5ff;
    border-radius: 12px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    transition: all 0.2s ease;
  }

  .links button:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 243, 255, 0.75);
    box-shadow: 0 0 0 1px rgba(0, 243, 255, 0.18), 0 8px 16px rgba(0, 0, 0, 0.28);
  }

  .links button.active {
    border-color: #00f3ff;
    color: #001017;
    background: linear-gradient(135deg, #00f3ff, #47dcff);
    box-shadow: 0 0 0 1px rgba(0, 243, 255, 0.28), 0 8px 20px rgba(0, 243, 255, 0.25);
  }

  .right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    min-width: 0;
  }

  .icon-btn {
    width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(0, 243, 255, 0.34);
    background: rgba(14, 28, 46, 0.55);
    color: #d9f5ff;
    border-radius: 999px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
  }

  .icon-btn:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 243, 255, 0.75);
    box-shadow: 0 0 0 1px rgba(0, 243, 255, 0.18), 0 8px 16px rgba(0, 0, 0, 0.28);
  }

  .icon-btn.active {
    border-color: #00f3ff;
    background: linear-gradient(135deg, #00f3ff, #47dcff);
    color: #001017;
  }

  .user {
    font-size: 13px;
    color: #e9f7ff;
    max-width: 170px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 6px 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .logout {
    border: 1px solid rgba(255, 107, 107, 0.55);
    color: #ffb1b1;
    background: rgba(49, 12, 12, 0.35);
    border-radius: 12px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .logout:hover {
    transform: translateY(-1px);
    border-color: rgba(255, 107, 107, 0.9);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.28);
  }

  @media (max-width: 1100px) {
    .app-nav {
      grid-template-columns: 1fr;
      gap: 10px;
      padding: 12px 14px;
    }

    .brand {
      text-align: center;
    }

    .links {
      justify-content: flex-start;
    }

    .right {
      justify-content: flex-start;
    }
  }
</style>
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
      <button class:active={isActive('/profile')} onclick={() => go('/profile')}>Perfil</button>

      {#if !getIsAdmin()}
        <button class:active={isActive('/cart')} onclick={() => go('/cart')}>Carrito</button>
      {/if}

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
      <span class="user">{appState.user?.username}</span>
      <button class="logout" onclick={handleLogout}>Salir</button>
    {/if}
  </div>
</nav>

<style>
  .app-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    background: rgba(10, 14, 26, 0.9);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
  }

  .brand {
    color: #00f3ff;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
  }

  .links {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: thin;
  }

  .links button,
  .logout {
    border: 1px solid rgba(0, 243, 255, 0.35);
    background: transparent;
    color: #d9f5ff;
    border-radius: 8px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 13px;
  }

  .links button.active {
    border-color: #00f3ff;
    color: #00f3ff;
    background: rgba(0, 243, 255, 0.14);
  }

  .right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user {
    font-size: 13px;
    color: #fff;
  }

  .logout {
    border-color: #ff6b6b;
    color: #ff8a8a;
  }

  @media (max-width: 900px) {
    .app-nav {
      grid-template-columns: 1fr;
    }

    .right {
      justify-content: flex-start;
    }
  }
</style>
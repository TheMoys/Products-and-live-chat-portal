<script>
  import { onMount, onDestroy } from 'svelte';
  import Router from 'svelte-spa-router';
  import routes from './router/routes.js';
  import { appState } from './state/appState.svelte.js';
  import { bootstrapAuth } from './services/authService.js';
  import AppNavBar from './components/AppNavBar.svelte';

  import '@/assets/main.css';
  import '@/assets/styles/products.css';
  import '@/assets/styles/chat.css';

  function getPathFromHash() {
    const hash = window.location.hash || '#/';
    const path = hash.replace(/^#/, '') || '/';
    return path.startsWith('/') ? path : `/${path}`;
  }

  let bootstrapping = $state(true);
  let currentPath = $state(typeof window !== 'undefined' ? getPathFromHash() : '/');

  const hideNav = $derived(currentPath === '/login' || currentPath === '/register');

  function onHashChange() {
    currentPath = getPathFromHash();
  }

  onMount(async () => {
    window.addEventListener('hashchange', onHashChange);

    try {
      await bootstrapAuth();
    } finally {
      bootstrapping = false;
    }
  });

  onDestroy(() => {
    window.removeEventListener('hashchange', onHashChange);
  });
</script>

<div id="app" class="gaming-app">
  {#if !hideNav}
    <AppNavBar />
  {/if}

  {#if bootstrapping || appState.authLoading}
    <div class="app-loading">
      <div class="loading-spinner"></div>
      <p>Cargando...</p>
    </div>
  {:else}
    <Router {routes} />
  {/if}
</div>
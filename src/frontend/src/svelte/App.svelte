<script>
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import routes from './router/routes.js';
  import { appState } from './state/appState.svelte.js';
  import { bootstrapAuth } from './services/authService.js';
  import AppNavBar from './components/AppNavBar.svelte';

  import '@/assets/main.css';
  import '@/assets/styles/products.css';
  import '@/assets/styles/chat.css';

  let bootstrapping = $state(true);

  onMount(async () => {
    try {
      await bootstrapAuth();
    } finally {
      bootstrapping = false;
    }
  });
</script>

<div id="app" class="gaming-app">
  <AppNavBar />

  {#if bootstrapping || appState.authLoading}
    <div class="app-loading">
      <div class="loading-spinner"></div>
      <p>Cargando...</p>
    </div>
  {:else}
    <Router {routes} />
  {/if}
</div>
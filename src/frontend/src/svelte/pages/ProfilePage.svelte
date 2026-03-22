<script>
  import { push } from 'svelte-spa-router';
  import { appState } from '../state/appState.svelte.js';

  function goProducts() {
    push('/products');
  }
</script>

<main class="page">
  <header class="page-header">
    <h1>Perfil</h1>
    <button class="btn" on:click={goProducts}>Volver a productos</button>
  </header>

  <section class="card">
    <p><strong>Usuario:</strong> {appState.user?.username || 'N/A'}</p>
    <p><strong>Email:</strong> {appState.user?.email || 'N/A'}</p>
    <p><strong>Rol:</strong> {appState.user?.role || 'N/A'}</p>
  </section>
</main>

<style>
  .page {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
    color: #fff;
  }
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .card {
    margin-top: 16px;
    padding: 16px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
  }
  .btn {
    border: 1px solid #00f3ff;
    background: transparent;
    color: #00f3ff;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
  }
</style>
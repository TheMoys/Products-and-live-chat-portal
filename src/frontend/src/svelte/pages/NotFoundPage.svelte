<script>
  import { push } from 'svelte-spa-router';
</script>

<main class="page">
  <h1>404</h1>
  <p>Pagina no encontrada.</p>
  <button class="btn" on:click={() => push('/products')}>Ir a productos</button>
</main>

<style>
  .page {
    min-height: 100vh;
    display: grid;
    place-content: center;
    gap: 12px;
    color: #fff;
    text-align: center;
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
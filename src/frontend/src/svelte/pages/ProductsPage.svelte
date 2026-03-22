<script>
  import { push } from 'svelte-spa-router';
  import { appState } from '../state/appState.svelte.js';
  import { logout } from '../services/authService.js';

  function goToProfile() {
    push('/profile');
  }

  function goToAdmin() {
    push('/admin/users');
  }

  function handleLogout() {
    logout();
    push('/login');
  }
</script>

<main class="page">
  <header class="page-header">
    <h1>Productos</h1>
    <div class="actions">
      <button class="btn" on:click={goToProfile}>Perfil</button>
      {#if appState.user?.role === 'admin'}
        <button class="btn" on:click={goToAdmin}>Admin Usuarios</button>
      {/if}
      <button class="btn btn-danger" on:click={handleLogout}>Cerrar sesion</button>
    </div>
  </header>

  <section class="card">
    <p>Pantalla de productos en migracion a Svelte.</p>
  </section>
</main>

<style>
  .page {
    max-width: 1100px;
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
  .actions {
    display: flex;
    gap: 8px;
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
  .btn-danger {
    border-color: #ff4d4f;
    color: #ff4d4f;
  }
</style>
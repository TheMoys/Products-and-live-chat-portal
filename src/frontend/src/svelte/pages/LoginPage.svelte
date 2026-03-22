<script>
  import { push } from 'svelte-spa-router';
  import { login } from '../services/authService.js';
  import { appState, getIsAuthenticated } from '../state/appState.svelte.js';
  import '@/assets/styles/auth.css';

  let form = $state({
    emailOrUsername: '',
    password: ''
  });

  let localError = $state('');

  $effect(() => {
    if (getIsAuthenticated()) {
      push('/products');
    }
  });

  async function handleSubmit(event) {
    event.preventDefault();
    localError = '';

    try {
      await login({
        emailOrUsername: form.emailOrUsername,
        password: form.password
      });
      push('/products');
    } catch (error) {
      localError = error?.message || 'Error al iniciar sesion';
    }
  }

  function goToRegister() {
    push('/register');
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <div class="logo-section">
      <h1 class="glitch">Arcane Archives</h1>
      <p class="subtitle">GAMING PORTAL</p>
    </div>

    <form class="auth-form" on:submit={handleSubmit}>
      <div class="input-group">
        <label for="emailOrUsername">Usuario o Email</label>
        <input
          id="emailOrUsername"
          type="text"
          bind:value={form.emailOrUsername}
          placeholder="Ingresa tu usuario o email"
          required
        />
      </div>

      <div class="input-group">
        <label for="password">Contrasena</label>
        <input
          id="password"
          type="password"
          bind:value={form.password}
          placeholder="Ingresa tu contrasena"
          required
        />
      </div>

      {#if localError || appState.authError}
        <div class="error-message">{localError || appState.authError}</div>
      {/if}

      <button type="submit" class="btn btn-primary" disabled={appState.authLoading}>
        {#if appState.authLoading}
          <span class="loader"></span>
        {:else}
          INICIAR SESION
        {/if}
      </button>
    </form>

    <div class="switch-auth">
      No tienes cuenta?
      <button type="button" class="link-like" on:click={goToRegister}>
        Registrate aqui
      </button>
    </div>
  </div>

  <div class="particles"></div>
</div>

<style>
  .link-like {
    background: none;
    border: none;
    color: var(--neon-blue, #00f3ff);
    cursor: pointer;
    text-decoration: underline;
    font: inherit;
    padding: 0;
  }
</style>
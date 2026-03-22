<script>
  import { push } from 'svelte-spa-router';
  import { register } from '../services/authService.js';
  import { appState, getIsAuthenticated } from '../state/appState.svelte.js';
  import '@/assets/styles/auth.css';

  let form = $state({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });

  let localError = $state('');

  $effect(() => {
    if (getIsAuthenticated()) {
      push('/products');
    }
  });

  function validateForm() {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      return 'Completa todos los campos obligatorios';
    }
    if (form.password.length < 6) {
      return 'La contrasena debe tener al menos 6 caracteres';
    }
    if (form.password !== form.confirmPassword) {
      return 'Las contrasenas no coinciden';
    }
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    localError = '';

    const validationError = validateForm();
    if (validationError) {
      localError = validationError;
      return;
    }

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        adminCode: form.adminCode
      });
      push('/products');
    } catch (error) {
      localError = error?.message || 'Error al registrar usuario';
    }
  }

  function goToLogin() {
    push('/login');
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <div class="logo-section">
      <h1 class="glitch">Arcane Archives</h1>
      <p class="subtitle">CREA TU CUENTA</p>
    </div>

    <form class="auth-form" on:submit={handleSubmit}>
      <div class="input-group">
        <label for="username">Usuario</label>
        <input
          id="username"
          type="text"
          bind:value={form.username}
          placeholder="Tu nombre de usuario"
          required
        />
      </div>

      <div class="input-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={form.email}
          placeholder="tu@email.com"
          required
        />
      </div>

      <div class="input-group">
        <label for="password">Contrasena</label>
        <input
          id="password"
          type="password"
          bind:value={form.password}
          placeholder="Minimo 6 caracteres"
          required
        />
      </div>

      <div class="input-group">
        <label for="confirmPassword">Confirmar contrasena</label>
        <input
          id="confirmPassword"
          type="password"
          bind:value={form.confirmPassword}
          placeholder="Repite la contrasena"
          required
        />
      </div>

      <div class="input-group">
        <label for="adminCode">Codigo admin (opcional)</label>
        <input
          id="adminCode"
          type="text"
          bind:value={form.adminCode}
          placeholder="Solo si aplica"
        />
      </div>

      {#if localError || appState.authError}
        <div class="error-message">{localError || appState.authError}</div>
      {/if}

      <button type="submit" class="btn btn-primary" disabled={appState.authLoading}>
        {#if appState.authLoading}
          <span class="loader"></span>
        {:else}
          CREAR CUENTA
        {/if}
      </button>
    </form>

    <div class="switch-auth">
      Ya tienes cuenta?
      <button type="button" class="link-like" on:click={goToLogin}>
        Inicia sesion
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
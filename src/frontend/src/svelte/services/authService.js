import axios from '@/services/axios';
import {
  appState,
  clearAuthState,
  verifySession,
  setAuth,
  setAuthLoading,
  setAuthError
} from '../state/appState.svelte.js';

function syncLegacyStorage(user, token) {
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
}

function normalizeError(error, fallback = 'Error de conexion') {
  return error?.response?.data?.message || fallback;
}

export async function login({ emailOrUsername, password }) {
  setAuthLoading(true);
  setAuthError('');

  try {
    const response = await axios.post('/auth/login', { emailOrUsername, password });
    setAuth(response.data.user, response.data.token);
    syncLegacyStorage(response.data.user, response.data.token);
    return response.data;
  } catch (error) {
    const message = normalizeError(error, 'Error al iniciar sesion');
    setAuthError(message);
    throw new Error(message);
  } finally {
    setAuthLoading(false);
  }
}

export async function register({ username, email, password, adminCode = '' }) {
  setAuthLoading(true);
  setAuthError('');

  try {
    const response = await axios.post('/auth/register', {
      username,
      email,
      password,
      adminCode: adminCode || undefined
    });
    setAuth(response.data.user, response.data.token);
    syncLegacyStorage(response.data.user, response.data.token);
    return response.data;
  } catch (error) {
    const message = normalizeError(error, 'Error al registrar usuario');
    setAuthError(message);
    throw new Error(message);
  } finally {
    setAuthLoading(false);
  }
}

export function logout() {
  clearAuthState();
}

export async function bootstrapAuth() {
  // Si no hay token, solo retorna
  if (!appState.token) {
    return false;
  }
  // Si hay token, verifica que sea válido
  return verifySession();
}
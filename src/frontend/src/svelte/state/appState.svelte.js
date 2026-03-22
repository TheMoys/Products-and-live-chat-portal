import axios from '@/services/axios';

const AUTH_STORAGE_KEY = 'auth_state_v1';

function loadAuthFromStorage() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    return {
      user: parsed?.user || null,
      token: parsed?.token || null
    };
  } catch {
    return { user: null, token: null };
  }
}

const initialAuth = loadAuthFromStorage();

export let appState = $state({
  user: initialAuth.user,
  token: initialAuth.token,
  authLoading: false,
  authError: '',
  products: [],
  productsLoading: false,
  productsError: '',
  filters: {
    search: '',
    minPrice: '',
    maxPrice: ''
  }
});

export function getIsAuthenticated() {
  return Boolean(appState.user && appState.token);
}

export function getIsAdmin() {
  return appState.user?.role === 'admin';
}

export function getFilteredProducts() {
  const search = appState.filters.search.trim().toLowerCase();
  const min = Number(appState.filters.minPrice || 0);
  const max = Number(appState.filters.maxPrice || Number.MAX_SAFE_INTEGER);

  return appState.products.filter((p) => {
    const title = (p.title || '').toLowerCase();
    const matchesSearch = !search || title.includes(search);
    const price = Number(p.price || 0);
    const matchesRange = price >= min && price <= max;
    return matchesSearch && matchesRange;
  });
}

export function getProductsCount() {
  return getFilteredProducts().length;
}

export function setAuth(user, token) {
  appState.user = user;
  appState.token = token;
  appState.authError = '';
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
}

export function setAuthLoading(value) {
  appState.authLoading = value;
}

export function setAuthError(message) {
  appState.authError = message;
}

export function clearAuthState() {
  appState.user = null;
  appState.token = null;
  appState.authError = '';
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function verifySession() {
  if (!appState.token) return false;

  setAuthLoading(true);
  setAuthError('');

  try {
    const response = await axios.get('/auth/verify');
    if (response?.data?.valid) {
      appState.user = response.data.user;
      return true;
    }
    clearAuthState();
    return false;
  } catch (error) {
    clearAuthState();
    setAuthError(error?.response?.data?.message || 'Sesion invalida');
    return false;
  } finally {
    setAuthLoading(false);
  }
}
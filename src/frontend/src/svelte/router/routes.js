import { push } from 'svelte-spa-router';
import { wrap } from 'svelte-spa-router/wrap';
import { appState, getIsAdmin } from '../state/appState.svelte.js';

function hasSession() {
  return Boolean(appState.token && appState.user);
}

function requireAuth() {
  if (!hasSession()) {
    push('/login');
    return false;
  }
  return true;
}

function requireGuest() {
  if (hasSession()) {
    push('/products');
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!hasSession()) {
    push('/login');
    return false;
  }

  if (!getIsAdmin()) {
    push('/products');
    return false;
  }

  return true;
}

const routes = {
  '/': wrap({
    asyncComponent: () => import('../pages/ProductsPage.svelte'),
    conditions: [requireAuth]
  }),

  '/login': wrap({
    asyncComponent: () => import('../pages/LoginPage.svelte'),
    conditions: [requireGuest]
  }),

  '/register': wrap({
    asyncComponent: () => import('../pages/RegisterPage.svelte'),
    conditions: [requireGuest]
  }),

  '/products': wrap({
    asyncComponent: () => import('../pages/ProductsPage.svelte'),
    conditions: [requireAuth]
  }),

  '/cart': wrap({
    asyncComponent: () => import('../pages/CartPage.svelte'),
    conditions: [requireAuth]
  }),

  '/checkout': wrap({
    asyncComponent: () => import('../pages/CheckoutPage.svelte'),
    conditions: [requireAuth]
  }),

  '/my-orders': wrap({
    asyncComponent: () => import('../pages/MyOrdersPage.svelte'),
    conditions: [requireAuth]
  }),

  '/orders/:id': wrap({
    asyncComponent: () => import('../pages/OrderDetailPage.svelte'),
    conditions: [requireAuth]
  }),

  '/profile': wrap({
    asyncComponent: () => import('../pages/ProfilePage.svelte'),
    conditions: [requireAuth]
  }),

  '/admin/users': wrap({
    asyncComponent: () => import('../pages/AdminUsersPage.svelte'),
    conditions: [requireAdmin]
  }),

  '/admin/orders': wrap({
    asyncComponent: () => import('../pages/AdminOrdersPage.svelte'),
    conditions: [requireAdmin]
  }),

  '*': wrap({
    asyncComponent: () => import('../pages/NotFoundPage.svelte')
  })
};

export default routes;
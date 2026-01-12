<script setup>
import { ref } from 'vue';
import { cartService } from '@/services/cartService';
import { orderService } from '@/services/orderService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const results = ref({});
const loading = ref(false);
const error = ref(null);

// TEST 1: Cart Service
const testCart = async () => {
  loading.value = true;
  error.value = null;
  try {
    console.log('🧪 Probando Cart Service...');
    
    // 1. Obtener carrito
    const cart = await cartService.getCart();
    console.log('✅ Cart obtenido:', cart);
    
    results.value.cart = cart;
  } catch (err) {
    console.error('❌ Error en Cart Service:', err);
    error.value = err.message || 'Error al probar cart service';
  } finally {
    loading.value = false;
  }
};

// TEST 2: Order Service
const testOrders = async () => {
  loading.value = true;
  error.value = null;
  try {
    console.log('🧪 Probando Order Service...');
    
    // 1. Obtener mis pedidos (GraphQL)
    const orders = await orderService.getMyOrders();
    console.log('✅ Orders obtenidos (GraphQL):', orders);
    
    results.value.orders = orders;
  } catch (err) {
    console.error('❌ Error en Order Service:', err);
    error.value = err.message || 'Error al probar order service';
  } finally {
    loading.value = false;
  }
};

// TEST 3: User Service (Solo Admin)
const testUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    console.log('🧪 Probando User Service (Admin)...');
    
    if (authStore.user?.role !== 'admin') {
      throw new Error('No eres admin. Este test requiere permisos de administrador.');
    }
    
    // 1. Obtener todos los usuarios
    const users = await userService.getAllUsers();
    console.log('✅ Users obtenidos:', users);
    
    results.value.users = users;
  } catch (err) {
    console.error('❌ Error en User Service:', err);
    error.value = err.message || 'Error al probar user service';
  } finally {
    loading.value = false;
  }
};

// TEST 4: Agregar producto al carrito
const testAddToCart = async () => {
  loading.value = true;
  error.value = null;
  try {
    console.log('🧪 Probando Add to Cart...');
    
    const productId = prompt('Ingresa el ID de un producto:');
    if (!productId) {
      throw new Error('ID de producto requerido');
    }
    
    const cart = await cartService.addItem(productId, 1);
    console.log('✅ Producto agregado al carrito:', cart);
    
    results.value.addToCart = cart;
  } catch (err) {
    console.error('❌ Error al agregar al carrito:', err);
    error.value = err.message || 'Error al agregar al carrito';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="test-container">
    <h1>🧪 Test de Servicios API</h1>

    <div class="user-info" v-if="authStore.isAuthenticated">
      <p><strong>Usuario:</strong> {{ authStore.user?.username }}</p>
      <p><strong>Rol:</strong> {{ authStore.user?.role }}</p>
      <p><strong>Token:</strong> {{ authStore.token ? '✅ Presente' : '❌ No hay token' }}</p>
    </div>

    <div class="not-logged" v-else>
      <p>❌ No has iniciado sesión. Por favor, inicia sesión primero.</p>
      <router-link to="/login">Ir a Login</router-link>
    </div>

    <div class="test-buttons" v-if="authStore.isAuthenticated">
      <button @click="testCart" :disabled="loading">
        🛒 Test Cart Service
      </button>
      
      <button @click="testOrders" :disabled="loading">
        📦 Test Order Service (GraphQL)
      </button>
      
      <button @click="testUsers" :disabled="loading" v-if="authStore.user?.role === 'admin'">
        👥 Test User Service (Admin)
      </button>

      <button @click="testAddToCart" :disabled="loading">
        ➕ Test Add to Cart
      </button>
    </div>

    <div class="loading" v-if="loading">
      <p>⏳ Cargando...</p>
    </div>

    <div class="error" v-if="error">
      <h3>❌ Error</h3>
      <p>{{ error }}</p>
    </div>

    <div class="results" v-if="Object.keys(results).length > 0">
      <h2>📊 Resultados</h2>
      <pre>{{ JSON.stringify(results, null, 2) }}</pre>
    </div>

    <div class="console-tip">
      <p>💡 <strong>Tip:</strong> Abre la consola del navegador (F12) para ver logs detallados</p>
    </div>
  </div>
</template>

<style scoped>
.test-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

.user-info {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.user-info p {
  margin: 5px 0;
}

.not-logged {
  background: #ffebee;
  border-left: 4px solid #f44336;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  text-align: center;
}

.not-logged a {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 20px;
  background: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
}

.test-buttons button {
  flex: 1;
  min-width: 200px;
  padding: 15px 25px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.test-buttons button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.test-buttons button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  background: #fff3cd;
  border-radius: 8px;
  margin-bottom: 20px;
}

.error {
  background: #ffebee;
  border-left: 4px solid #f44336;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.error h3 {
  margin-top: 0;
  color: #c62828;
}

.results {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.results h2 {
  margin-top: 0;
  color: #2c3e50;
}

.results pre {
  background: #263238;
  color: #aed581;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.6;
}

.console-tip {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.console-tip p {
  margin: 0;
  color: #1565c0;
}
</style>
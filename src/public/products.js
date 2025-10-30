const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let editingProductId = null;

// Verificar autenticación al cargar
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(user);
    initPage();
});

function initPage() {
    // Mostrar info del usuario
    document.getElementById('userInfo').innerHTML = `
        <p>Usuario: <strong>${currentUser.username}</strong> | Rol: <strong>${currentUser.role}</strong></p>
    `;
    
    // Si es admin, mostrar formulario y columna de acciones
    if (currentUser.role === 'admin') {
        document.getElementById('productForm').style.display = 'block';
        document.getElementById('actionsHeader').style.display = 'table-cell';
    }
    
    loadProducts();
    
    // Event listener para el formulario
    document.getElementById('form').addEventListener('submit', handleSubmit);
}

async function loadProducts() {
    const token = localStorage.getItem('token');
    const messageDiv = document.getElementById('message');
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'Error al cargar productos';
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('productList');
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay productos</td></tr>';
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.title}</td>
            <td>${product.description || '-'}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            ${currentUser.role === 'admin' ? `
                <td>
                    <button onclick="editProduct('${product._id}')">Editar</button>
                    <button onclick="deleteProduct('${product._id}')">Eliminar</button>
                </td>
            ` : ''}
        `;
        tbody.appendChild(row);
    });
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const messageDiv = document.getElementById('message');
    
    const productData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value) || 0
    };
    
    try {
        let response;
        
        if (editingProductId) {
            // Actualizar
            response = await fetch(`${API_URL}/products/${editingProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Crear
            response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar');
        }
        
        messageDiv.textContent = editingProductId ? 'Producto actualizado' : 'Producto creado';
        messageDiv.style.color = 'green';
        
        // Limpiar formulario
        document.getElementById('form').reset();
        editingProductId = null;
        document.getElementById('formTitle').textContent = 'Agregar Producto';
        
        // Recargar lista
        loadProducts();
        
        setTimeout(() => messageDiv.textContent = '', 3000);
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = error.message;
        messageDiv.style.color = 'red';
    }
}

async function editProduct(id) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar producto');
        
        const product = await response.json();
        
        // Rellenar formulario
        document.getElementById('title').value = product.title;
        document.getElementById('description').value = product.description || '';
        document.getElementById('price').value = product.price;
        document.getElementById('stock').value = product.stock;
        
        editingProductId = id;
        document.getElementById('formTitle').textContent = 'Editar Producto';
        
        // Scroll al formulario
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar producto para editar');
    }
}

function cancelEdit() {
    document.getElementById('form').reset();
    editingProductId = null;
    document.getElementById('formTitle').textContent = 'Agregar Producto';
}

async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    const token = localStorage.getItem('token');
    const messageDiv = document.getElementById('message');
    
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        messageDiv.textContent = 'Producto eliminado';
        messageDiv.style.color = 'green';
        
        loadProducts();
        
        setTimeout(() => messageDiv.textContent = '', 3000);
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'Error al eliminar producto';
        messageDiv.style.color = 'red';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
let currentUser = null;

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
        <p>
            👤 Usuario: <strong>${currentUser.username}</strong> | 
            📧 Email: <strong>${currentUser.email}</strong> | 
            🎭 Rol: <strong>${currentUser.role.toUpperCase()}</strong>
        </p>
    `;
    
    // Si es admin, mostrar enlace especial
    if (currentUser.role === 'admin') {
        document.getElementById('adminLink').style.display = 'block';
    }
}

function logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}
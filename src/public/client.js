
const apiBase = '/api';

async function fetchProducts() {
    const res = await fetch(`${apiBase}/products`);
    const products = await res.json();
    const root = document.getElementById('products');
    root.innerHTML = products.map(p => `<div><h3>${p.title} — $${p.price}</h3><p>${p.description || ''}</p></div>`).join('');
}

fetchProducts();


function saveToken(t) { localStorage.setItem('token', t); }
function getToken() { return localStorage.getItem('token'); }

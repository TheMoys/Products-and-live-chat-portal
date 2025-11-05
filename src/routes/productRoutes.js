const express = require('express');
const router = express.Router();
const Product = require('../models/Products');
const { authenticateJWT } = require('../middleware/authenticateJWT');

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
});

// Crear producto
router.post('/', authenticateJWT, async (req, res) => {
    try {
        const { title, description, price, stock, imageUrl, imageData } = req.body;

        if (!title || !price) {
            return res.status(400).json({ message: 'Título y precio son requeridos' });
        }

        const product = new Product({
            title,
            description,
            price: parseFloat(price),
            stock: parseInt(stock) || 0,
            imageUrl: imageUrl || null,
            imageData: imageData || null
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
});

// Actualizar producto
router.put('/:id', authenticateJWT, async (req, res) => {
    try {
        const { title, description, price, stock, imageUrl, imageData } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        if (title) product.title = title;
        if (description !== undefined) product.description = description;
        if (price) product.price = parseFloat(price);
        if (stock !== undefined) product.stock = parseInt(stock);
        if (imageUrl !== undefined) product.imageUrl = imageUrl;
        if (imageData !== undefined) product.imageData = imageData;

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
});

// Eliminar producto
router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
});

module.exports = router;
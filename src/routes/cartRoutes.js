const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Products');
const { authenticateJWT } = require('../middleware/authenticateJWT');

router.get('/', authenticateJWT, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
            await cart.save();
        }
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener carrito', error: error.message });
    }
});

router.post('/items', authenticateJWT, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Stock insuficiente' });
        }
        
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }
        
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );
        
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity, price: product.price });
        }
        
        await cart.save();
        await cart.populate('items.product');
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar al carrito', error: error.message });
    }
});

router.put('/items/:productId', authenticateJWT, async (req, res) => {
    try {
        const { quantity } = req.body;
        
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }
        
        const item = cart.items.find(i => i.product.toString() === req.params.productId);
        if (!item) {
            return res.status(404).json({ message: 'Producto no encontrado en carrito' });
        }
        
        item.quantity = quantity;
        await cart.save();
        await cart.populate('items.product');
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar carrito', error: error.message });
    }
});

router.delete('/items/:productId', authenticateJWT, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }
        
        cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
        await cart.save();
        await cart.populate('items.product');
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar del carrito', error: error.message });
    }
});

router.delete('/', authenticateJWT, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Carrito vaciado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al vaciar carrito', error: error.message });
    }
});

module.exports = router;
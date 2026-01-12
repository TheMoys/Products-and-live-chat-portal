const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Products');
const { authenticateJWT } = require('../middleware/authenticateJWT');

router.post('/', authenticateJWT, async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Carrito vacío' });
        }
        
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Stock insuficiente para ${item.product.title}` 
                });
            }
        }
        
        const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const order = new Order({
            user: req.user._id,
            items: cart.items.map(item => ({
                product: item.product._id,
                title: item.product.title,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            shippingAddress,
            status: 'pending'
        });
        
        await order.save();
        
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }
        
        cart.items = [];
        await cart.save();
        
        await order.populate('user items.product');
        
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear pedido', error: error.message });
    }
});

router.get('/my-orders', authenticateJWT, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('items.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
    }
});

router.get('/:id', authenticateJWT, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'username email')
            .populate('items.product');
        
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pedido', error: error.message });
    }
});

router.get('/', authenticateJWT, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        
        const { status } = req.query;
        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'username email')
            .populate('items.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
    }
});

router.put('/:id/status', authenticateJWT, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user items.product');
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar estado', error: error.message });
    }
});

module.exports = router;
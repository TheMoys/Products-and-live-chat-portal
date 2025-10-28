const express = require('express');
const Product = require('../models/Products');
const { authenticateJWT, authorizeRole } = require('../middleware/authenticateJWT');

const router = express.Router();

// GET /api/products - listado (accesible para todos autenticados o público?)
router.get('/', async (req, res) => {
    // opción: mostrar público sin auth
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
});

// Para crear/editar/eliminar: proteger con JWT + rol admin
router.post('/', authenticateJWT, authorizeRole('admin'), async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
});

router.put('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
    try {
        const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!p) return res.status(404).json({ message: 'Not found' });
        res.json(p);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
});

router.delete('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

module.exports = router;

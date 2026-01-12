const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const { authenticateJWT } = require('../middleware/authenticateJWT');

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
};

router.get('/', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
});

router.put('/:id/role', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Rol inválido' });
        }
        
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'No puedes cambiar tu propio rol' });
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar rol', error: error.message });
    }
});

router.delete('/:id', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
        }
        
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/Users'); // ✅ CAMBIO: Users.js (plural)
const { authenticateJWT, authorizeRole } = require('../middleware/authenticateJWT'); // ✅ CAMBIO

// ✅ Middleware combinado: autenticación + admin
const adminMiddleware = [authenticateJWT, authorizeRole('admin')];

// ✅ GET /api/users/stats - Estadísticas (DEBE IR PRIMERO)
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const total = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    res.json({
      total,
      admins,
      regularUsers,
      newUsers
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

// ✅ GET /api/users - Obtener todos los usuarios (ADMIN)
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { search, role } = req.query;
    
    let filter = {};
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// ✅ GET /api/users/:id - Obtener usuario específico (ADMIN)
router.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
});

// ✅ PUT /api/users/:id - Actualizar usuario (ADMIN)
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'El username ya existe' });
      }
    }
    
    if (email) {
      const existingEmail = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingEmail) {
        return res.status(400).json({ message: 'El email ya existe' });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

// ✅ DELETE /api/users/:id - Eliminar usuario (ADMIN)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({ 
      message: 'Usuario eliminado correctamente', 
      user: { id: user._id, username: user.username } 
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

// ✅ PATCH /api/users/:id/toggle-status - Activar/Desactivar usuario (ADMIN)
router.patch('/:id/toggle-status', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes desactivarte a ti mismo' });
    }
    
    // Si no existe el campo, lo crea como true por defecto
    user.isActive = user.isActive !== undefined ? !user.isActive : false;
    await user.save();
    
    res.json({ 
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} correctamente`,
      user: {
        id: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error cambiando estado:', error);
    res.status(500).json({ message: 'Error al cambiar estado del usuario' });
  }
});

module.exports = router;
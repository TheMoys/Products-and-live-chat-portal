const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { authenticateJWT } = require('../middleware/authenticateJWT'); // ← AGREGAR ESTA LÍNEA

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) return res.status(409).json({ message: 'User already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashed, role: role || 'user' });
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ token, user: { _id: user._id, username: user.username, email: user.email, role: user.role } }); // ← Cambié 'id' a '_id'
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password) return res.status(400).json({ message: 'Missing fields' });

        const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ token, user: { _id: user._id, username: user.username, email: user.email, role: user.role } }); // ← Cambié 'id' a '_id'
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify token
router.get('/verify', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); // ← Cambié 'req.user.userId' a 'req.user._id'
        
        if (!user) {
            return res.status(404).json({ valid: false, message: 'Usuario no encontrado' });
        }

        res.json({
            valid: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ valid: false, message: 'Error al verificar token' });
    }
});

module.exports = router;
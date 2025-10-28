// src/middleware/authenticateJWT.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/Users');

const authenticateJWT = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });

    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware para Socket.IO: añade socket.user
const verifySocketJWT = async (socket) => {
    const token = socket.handshake.auth?.token || (socket.handshake.headers?.authorization ? socket.handshake.headers.authorization.split(' ')[1] : null);
    if (!token) throw new Error('No token');
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) throw new Error('User not found');
    socket.user = user;
};

const authorizeRole = (role) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden: insufficient role' });
    next();
};

module.exports = { authenticateJWT, authorizeRole, verifySocketJWT };

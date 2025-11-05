const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticateJWT } = require('../middleware/authenticateJWT');

// Obtener historial de mensajes (últimos 50)
router.get('/messages', authenticateJWT, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        
        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            user: {
                id: msg.user.toString(),  // Convertir ObjectId a string
                _id: msg.user.toString(), // Agregar también como _id
                username: msg.username
            },
            text: msg.text,
            createdAt: msg.createdAt
        }));

        // Invertir para que los más antiguos estén primero
        const reversedMessages = messages.reverse();

        res.json(reversedMessages);
    } catch (error) {
        console.error('❌ Error al obtener mensajes:', error);
        res.status(500).json({ message: 'Error al obtener mensajes', error: error.message });
    }
});

module.exports = router;
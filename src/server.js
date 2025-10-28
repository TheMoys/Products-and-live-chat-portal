// src/server.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const { PORT, MONGODB_URI } = require('./config');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { verifySocketJWT } = require('./middleware/authenticateJWT');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO: comprobar JWT en la conexión
io.use(async (socket, next) => {
    try {
        await verifySocketJWT(socket);
        next();
    } catch (err) {
        next(new Error('Unauthorized socket'));
    }
});

io.on('connection', (socket) => {
    const user = socket.user; // asignado en verifySocketJWT
    console.log(`Usuario conectado: ${user.username} (${user._id})`);

    socket.on('chat:message', (msg) => {
        // msg: { text }
        const payload = { user: { id: user._id, username: user.username }, text: msg.text, createdAt: new Date() };
        io.emit('chat:message', payload);
    });

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${user.username}`);
    });
});

// Conexión a MongoDB y arranque del servidor
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB conectado');
        server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
    })
    .catch(err => {
        console.error('Error al conectar a MongoDB', err);
        process.exit(1);
    });

module.exports = { app, io };

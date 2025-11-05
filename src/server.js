const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const { PORT, MONGODB_URI } = require('./config');

const Message = require('./models/Message');
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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
    const user = socket.user;

    socket.on('chat:typing', () => {
        socket.broadcast.emit('chat:user-typing', {
            userId: user._id,
            username: user.username
        });
    });

    socket.on('chat:stop-typing', () => {
        socket.broadcast.emit('chat:user-stop-typing', {
            userId: user._id,
            username: user.username
        });
    });

    socket.on('chat:message', async (msg) => {
        try {

            // Guardar mensaje en MongoDB
            const message = new Message({
                user: user._id,
                username: user.username,
                text: msg.text
            });

            await message.save();

            // Emitir mensaje a todos los clientes
            const payload = {
                _id: message._id,
                user: {
                    id: user._id.toString(),
                    _id: user._id.toString(),
                    username: user.username
                },
                text: message.text,
                createdAt: message.createdAt
            };

            io.emit('chat:message', payload);
        } catch (error) {
            socket.emit('chat:error', { message: 'Error al enviar mensaje' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`❌ Usuario desconectado: ${user.username}`);
    });
});

// Conexión a MongoDB y arranque del servidor
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        server.listen(PORT, '0.0.0.0', () => console.log(`Servidor en puerto ${PORT}`));
    })
    .catch(err => {
        process.exit(1);
    });

module.exports = { app, io };

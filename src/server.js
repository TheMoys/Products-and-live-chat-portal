const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const { PORT, MONGODB_URI } = require('./config');

const Message = require('./models/Message');
const connectedUsers = new Map();
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

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../dist');
  console.log('📂 Sirviendo frontend desde:', frontendPath);
  app.use(express.static(frontendPath));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

// Servir index.html para todas las demás rutas (SPA)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
  });
}

// Socket.IO: comprobar JWT en la conexión
io.use(async (socket, next) => {
    try {
        await verifySocketJWT(socket);
        next();
    } catch (err) {
        console.error('❌ Socket auth error:', err.message);
        next(new Error('Unauthorized socket'));
    }
});

io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`✅ Usuario conectado: ${user.username} (${socket.id})`);

    connectedUsers.set(user._id.toString(), {
        userId: user._id.toString(),
        username: user.username,
        socketId: socket.id
    });
    io.emit('chat:users-update', Array.from(connectedUsers.values()));

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
            const message = new Message({
                user: user._id,
                username: user.username,
                text: msg.text
            });

            await message.save();

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
            console.error('❌ Error al guardar mensaje:', error);
            socket.emit('chat:error', { message: 'Error al enviar mensaje' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`❌ Usuario desconectado: ${user.username}`);
        connectedUsers.delete(user._id.toString());
        io.emit('chat:users-update', Array.from(connectedUsers.values()));
    });
});

// Conexión a MongoDB y arranque del servidor
console.log('🔄 Conectando a MongoDB...');
console.log('📍 MONGODB_URI:', MONGODB_URI ? 'Configurado ✅' : 'NO configurado ❌');
console.log('📍 PORT:', PORT);
console.log('📍 NODE_ENV:', process.env.NODE_ENV);

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado a MongoDB exitosamente');
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch(err => {
        console.error('❌ Error fatal al conectar a MongoDB:');
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
        process.exit(1);
    });

module.exports = { app, io };
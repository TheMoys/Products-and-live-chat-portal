const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');

const { PORT, MONGODB_URI } = require('./config');

const Message = require('./models/Message');
const connectedUsers = new Map();
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { verifySocketJWT, authenticateJWT } = require('./middleware/authenticateJWT');

// GraphQL
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

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

// Routes REST
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Función para obtener usuario del JWT (GraphQL)
const getUser = async (req) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const { JWT_SECRET } = require('./config');
            const decoded = jwt.verify(token, JWT_SECRET);
            const User = require('./models/Users');
            const user = await User.findById(decoded.id);
            return user;
        } catch (error) {
            return null;
        }
    }
    
    return null;
};

// Configurar Apollo Server
async function startApolloServer() {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            const user = await getUser(req);
            return { user };
        },
        playground: process.env.GRAPHQL_PLAYGROUND === 'true',
        introspection: true
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ 
        app, 
        path: process.env.GRAPHQL_PATH || '/graphql' 
    });

    console.log(`🚀 GraphQL disponible en http://localhost:${PORT}${apolloServer.graphqlPath}`);
}

// Socket.IO
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
            socket.emit('chat:error', { message: 'Error al enviar mensaje' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`❌ Usuario desconectado: ${user.username}`);
        connectedUsers.delete(user._id.toString());
        io.emit('chat:users-update', Array.from(connectedUsers.values()));
    });
});

// Conexión a MongoDB y arranque
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('✅ Conectado a MongoDB');
        
        // Iniciar GraphQL
        await startApolloServer();
        
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Servidor REST en puerto ${PORT}`);
            console.log(`✅ Socket.IO funcionando`);
        });
    })
    .catch(err => {
        console.error('❌ Error MongoDB:', err);
        process.exit(1);
    });

module.exports = { app, io };
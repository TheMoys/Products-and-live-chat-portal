require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/portal-productos',
    JWT_SECRET: process.env.JWT_SECRET || 'cambiame_por_una_clave_segura',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h'
};

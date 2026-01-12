const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const Product = require('../../models/Products');

const orderResolvers = {
  Query: {
    myOrders: async (_, __, { user }) => {
      if (!user) throw new Error('No autenticado');
      
      return await Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .populate('items.product')
        .populate('user');
    },
    
    order: async (_, { id }, { user }) => {
      if (!user) throw new Error('No autenticado');
      
      const order = await Order.findById(id)
        .populate('user')
        .populate('items.product');
      
      if (!order) throw new Error('Pedido no encontrado');
      
      if (order.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
        throw new Error('Acceso denegado');
      }
      
      return order;
    },
    
    allOrders: async (_, { status }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Acceso denegado');
      
      let query = {};
      if (status) query.status = status;
      
      return await Order.find(query)
        .sort({ createdAt: -1 })
        .populate('user')
        .populate('items.product');
    }
  },
  
  Mutation: {
    createOrder: async (_, { shippingAddress }, { user }) => {
      if (!user) throw new Error('No autenticado');
      
      const cart = await Cart.findOne({ user: user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) throw new Error('Carrito vacío');
      
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${item.product.title}`);
        }
      }
      
      const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const order = new Order({
        user: user._id,
        items: cart.items.map(item => ({
          product: item.product._id,
          title: item.product.title,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount,
        shippingAddress,
        status: 'pending'
      });
      
      await order.save();
      
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity }
        });
      }
      
      cart.items = [];
      await cart.save();
      
      await order.populate('user items.product');
      return order;
    },
    
    updateOrderStatus: async (_, { orderId, status }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Acceso denegado');
      
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      ).populate('user items.product');
      
      if (!order) throw new Error('Pedido no encontrado');
      return order;
    }
  }
};

module.exports = orderResolvers;
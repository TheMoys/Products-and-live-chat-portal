const Cart = require('../../models/Cart');
const Product = require('../../models/Products');

const cartResolvers = {
  Query: {
    getCart: async (_, __, { user }) => {
      if (!user) throw new Error('No autenticado');
      
      let cart = await Cart.findOne({ user: user._id })
        .populate('items.product')
        .populate('user');
      
      if (!cart) {
        cart = new Cart({ 
          user: user._id, 
          items: [],
          totalAmount: 0  // ✅ Inicializar totalAmount
        });
        await cart.save();
        await cart.populate('user');
      }
      
      return cart;
    }
  },
  
  Mutation: {
    addToCart: async (_, { productId, quantity }, { user }) => {
      if (!user) throw new Error('No autenticado');
      
      const product = await Product.findById(productId);
      if (!product) throw new Error('Producto no encontrado');
      if (product.stock < quantity) throw new Error('Stock insuficiente');
      
      let cart = await Cart.findOne({ user: user._id });
      if (!cart) cart = new Cart({ user: user._id, items: [] });
      
      const existingItem = cart.items.find(item => item.product.toString() === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, price: product.price });
      }

      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
      
      await cart.save();
      await cart.populate('items.product user');
      return cart;
    },
    
    updateCartItem: async (_, { productId, quantity }, { user }) => {
      if (!user) throw new Error('No autenticado');
      
      const cart = await Cart.findOne({ user: user._id });
      if (!cart) throw new Error('Carrito no encontrado');
      
      const item = cart.items.find(i => i.product.toString() === productId);
      if (!item) throw new Error('Producto no encontrado en carrito');
      
      item.quantity = quantity;

      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      await cart.save();
      await cart.populate('items.product user');
      return cart;
    },
    
    removeFromCart: async (_, { productId }, { user }) => {
      if (!user) throw new Error('No autenticado');
      
      const cart = await Cart.findOne({ user: user._id });
      if (!cart) throw new Error('Carrito no encontrado');
      
      cart.items = cart.items.filter(i => i.product.toString() !== productId);

      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      await cart.save();
      await cart.populate('items.product user');
      return cart;
    },
    
    clearCart: async (_, __, { user }) => {
      if (!user) throw new Error('No autenticado');
      
      let cart = await Cart.findOne({ user: user._id });
      
      if (!cart) {
        cart = new Cart({ 
          user: user._id, 
          items: [],
          totalAmount: 0
        });
        await cart.save();
      } else {
        cart.items = [];
        cart.totalAmount = 0; // ✅ Resetear totalAmount
        await cart.save();
      }
      
      await cart.populate('items.product user');
      
      return cart;
    }
  }
};

module.exports = cartResolvers;
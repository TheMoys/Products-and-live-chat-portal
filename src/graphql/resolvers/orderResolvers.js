const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const Product = require('../../models/Products');

// ✅ Función para generar número de orden único
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

const orderResolvers = {
  Query: {
    // Obtener mis órdenes
    myOrders: async (_, __, { user }) => {
      if (!user) throw new Error('No autenticado');

      try {
        const orders = await Order.find({ user: user._id })
          .populate('user')
          .populate('items.product')
          .sort({ createdAt: -1 });

        return orders;
      } catch (error) {
        console.error('Error en myOrders:', error);
        throw error;
      }
    },

    // Obtener detalle de una orden
    order: async (_, { id }, { user }) => {
      if (!user) throw new Error('No autenticado');

      try {
        const order = await Order.findById(id)
          .populate('user')
          .populate('items.product');

        if (!order) {
          throw new Error('Orden no encontrada');
        }

        // Verificar que sea el dueño o admin
        if (order.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
          throw new Error('No autorizado para ver esta orden');
        }

        return order;
      } catch (error) {
        console.error('Error en order:', error);
        throw error;
      }
    },

    // Obtener todas las órdenes (ADMIN)
    allOrders: async (_, { status }, { user }) => {
      if (!user) throw new Error('No autenticado');
      if (user.role !== 'admin') throw new Error('No autorizado');

      try {
        const filter = status ? { status } : {};
        const orders = await Order.find(filter)
          .populate('user')
          .populate('items.product')
          .sort({ createdAt: -1 });

        return orders;
      } catch (error) {
        console.error('Error en allOrders:', error);
        throw error;
      }
    }
  },

  Mutation: {
    // Crear orden desde el carrito
    createOrder: async (_, { shippingAddress }, { user }) => {
      if (!user) throw new Error('No autenticado');

      try {
        console.log('📦 Iniciando creación de orden para usuario:', user.username);

        // 1. Obtener el carrito del usuario
        const cart = await Cart.findOne({ user: user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
          throw new Error('El carrito está vacío');
        }

        console.log('🛒 Carrito encontrado con', cart.items.length, 'items');

        // 2. Verificar stock de todos los productos
        for (const item of cart.items) {
          const product = await Product.findById(item.product._id);
          
          if (!product) {
            throw new Error(`Producto ${item.product.title} no encontrado`);
          }

          if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para ${product.title}. Disponibles: ${product.stock}`);
          }
        }

        // 3. ✅ Calcular totalAmount explícitamente
        const orderItems = cart.items.map(item => ({
          product: item.product._id,
          title: item.product.title,
          quantity: item.quantity,
          price: item.price
        }));

        const totalAmount = orderItems.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);

        console.log('💰 Total calculado:', totalAmount);

        // 4. ✅ Verificar que todos los campos required estén presentes
        if (!user._id) throw new Error('Usuario no válido');
        if (!orderItems || orderItems.length === 0) throw new Error('Items vacíos');
        if (!totalAmount || totalAmount <= 0) throw new Error('Total inválido');
        if (!shippingAddress) throw new Error('Dirección de envío requerida');

        // 5. Crear la orden con todos los campos required
        const order = new Order({
          user: user._id,                    // ✅ Required
          orderNumber: generateOrderNumber(), // ✅ Required (generado)
          items: orderItems,                  // ✅ Required
          totalAmount: totalAmount,           // ✅ Required (calculado)
          shippingAddress: {                  // ✅ Optional pero incluido
            street: shippingAddress.street || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            zipCode: shippingAddress.zipCode || '',
            country: shippingAddress.country || ''
          },
          status: 'pending'                   // ✅ Default value
        });

        console.log('📝 Datos de la orden:', {
          user: order.user,
          orderNumber: order.orderNumber,
          itemsCount: order.items.length,
          totalAmount: order.totalAmount,
          status: order.status
        });

        // 6. Guardar la orden
        await order.save();
        console.log('✅ Orden guardada:', order.orderNumber);

        // 7. Reducir el stock de los productos
        for (const item of cart.items) {
          await Product.findByIdAndUpdate(
            item.product._id,
            { $inc: { stock: -item.quantity } }
          );
          console.log(`📦 Stock reducido para ${item.product.title}: -${item.quantity}`);
        }

        // 8. Vaciar el carrito
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        console.log('🗑️ Carrito vaciado');

        // 9. Retornar orden con datos poblados
        await order.populate('user');
        await order.populate('items.product');

        console.log('✅ Orden creada exitosamente:', order.orderNumber);
        return order;
      } catch (error) {
        console.error('❌ Error al crear orden:', error.message);
        console.error('Stack:', error.stack);
        throw error;
      }
    },

    // Actualizar estado de orden (ADMIN)
    updateOrderStatus: async (_, { orderId, status }, { user }) => {
      if (!user) throw new Error('No autenticado');
      if (user.role !== 'admin') throw new Error('No autorizado');

      try {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
          throw new Error(`Estado inválido. Debe ser: ${validStatuses.join(', ')}`);
        }

        const order = await Order.findByIdAndUpdate(
          orderId,
          { status },
          { new: true }
        )
          .populate('user')
          .populate('items.product');

        if (!order) {
          throw new Error('Orden no encontrada');
        }

        console.log(`✅ Estado de orden ${order.orderNumber} actualizado a: ${status}`);
        return order;
      } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
        throw error;
      }
    }
  }
};

module.exports = orderResolvers;
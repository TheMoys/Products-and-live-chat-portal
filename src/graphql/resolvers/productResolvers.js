const Product = require('../../models/Products');

const productResolvers = {
  Query: {
    products: async (_, { category, search }) => {
      try {
        let query = {};
        
        if (category) {
          query.category = category;
        }
        
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
        
        return await Product.find(query).sort({ createdAt: -1 });
      } catch (error) {
        throw new Error('Error al obtener productos');
      }
    },
    
    product: async (_, { id }) => {
      try {
        const product = await Product.findById(id);
        if (!product) {
          throw new Error('Producto no encontrado');
        }
        return product;
      } catch (error) {
        throw new Error('Error al obtener producto');
      }
    }
  }
};

module.exports = productResolvers;
import graphqlClient from './graphqlClient';

const cartService = {
  // Obtener carrito
  async getCart() {
    const query = `
      query GetCart {
        getCart {
          id
          items {
            product {
              id
              title
              description
              price
              imageUrl
              imageData
              stock
            }
            quantity
            price
          }
          totalAmount
          updatedAt
        }
      }
    `;

    try {
      const response = await graphqlClient.request(query);
      return response.getCart;
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      throw error;
    }
  },

  // Añadir producto al carrito
  async addToCart(productId, quantity = 1) {
    const mutation = `
      mutation AddToCart($productId: ID!, $quantity: Int!) {
        addToCart(productId: $productId, quantity: $quantity) {
          id
          items {
            product {
              id
              title
              description
              price
              imageUrl
              imageData
              stock
            }
            quantity
            price
          }
          totalAmount
        }
      }
    `;

    try {
      const response = await graphqlClient.request(mutation, {
        productId,
        quantity
      });
      return response.addToCart;
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      throw error;
    }
  },

  // Actualizar cantidad de un producto
  async updateCartItem(productId, quantity) {
    const mutation = `
      mutation UpdateCartItem($productId: ID!, $quantity: Int!) {
        updateCartItem(productId: $productId, quantity: $quantity) {
          id
          items {
            product {
              id
              title
              description
              price
              imageUrl
              imageData
              stock
            }
            quantity
            price
          }
          totalAmount
        }
      }
    `;

    try {
      const response = await graphqlClient.request(mutation, {
        productId,
        quantity
      });
      return response.updateCartItem;
    } catch (error) {
      console.error('Error al actualizar carrito:', error);
      throw error;
    }
  },

  // Eliminar producto del carrito
  async removeFromCart(productId) {
    const mutation = `
      mutation RemoveFromCart($productId: ID!) {
        removeFromCart(productId: $productId) {
          id
          items {
            product {
              id
              title
              description
              price
              imageUrl
              imageData
              stock
            }
            quantity
            price
          }
          totalAmount
        }
      }
    `;

    try {
      const response = await graphqlClient.request(mutation, { productId });
      return response.removeFromCart;
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      throw error;
    }
  },

  // Vaciar carrito
  async clearCart() {
    const mutation = `
      mutation ClearCart {
        clearCart {
          id
          items {
            product {
              id
              title
              description
              price
              imageUrl
              imageData
              stock
            }
            quantity
            price
          }
          totalAmount
        }
      }
    `;

    try {
      const response = await graphqlClient.request(mutation);
      return response.clearCart;
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      throw error;
    }
  }
};

export default cartService;
import graphqlClient from './graphqlClient';

const orderService = {
  // Crear pedido
  async createOrder(shippingAddress) {
    const mutation = `
      mutation CreateOrder($shippingAddress: ShippingAddressInput!) {
        createOrder(shippingAddress: $shippingAddress) {
          id
          orderNumber
          totalAmount
          status
          createdAt
        }
      }
    `;

    try {
      const response = await graphqlClient.request(mutation, { shippingAddress });
      return response.createOrder;
    } catch (error) {
      console.error('Error al crear orden:', error);
      throw error;
    }
  },

  // Obtener mis pedidos
  async getMyOrders() {
    const query = `
      query GetMyOrders {
        myOrders {
          id
          orderNumber
          totalAmount
          status
          createdAt
          items {
            title
            quantity
            price
            product {
              id
              title
              imageUrl
              imageData
            }
          }
          shippingAddress {
            street
            city
            state
            zipCode
            country
          }
        }
      }
    `;

    try {
      const response = await graphqlClient.request(query);
      return response.myOrders;
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      throw error;
    }
  },

  // Obtener detalle de pedido
  async getOrderDetail(orderId) {
    const query = `
      query GetOrder($id: ID!) {
        order(id: $id) {
          id
          orderNumber
          totalAmount
          status
          createdAt
          user {
            id
            username
            email
          }
          items {
            title
            quantity
            price
            product {
              id
              title
              imageUrl
              imageData
              description
            }
          }
          shippingAddress {
            street
            city
            state
            zipCode
            country
          }
        }
      }
    `;

    try {
      const response = await graphqlClient.request(query, { id: orderId });
      return response.order;
    } catch (error) {
      console.error('Error al obtener detalle de orden:', error);
      throw error;
    }
  },

  // Actualizar estado de pedido (ADMIN)
  async updateOrderStatus(orderId, status) {
    const mutation = `
      mutation UpdateOrderStatus($orderId: ID!, $status: String!) {
        updateOrderStatus(orderId: $orderId, status: $status) {
          id
          orderNumber
          status
          updatedAt
        }
      }
    `;

    try {
      const response = await graphqlClient.request(mutation, { orderId, status });
      return response.updateOrderStatus;
    } catch (error) {
      console.error('Error al actualizar estado de orden:', error);
      throw error;
    }
  },

  // Obtener todas las órdenes (ADMIN)
  async getAllOrders(statusFilter = null) {
    const query = `
      query GetAllOrders($status: String) {
        allOrders(status: $status) {
          id
          orderNumber
          totalAmount
          status
          createdAt
          user {
            id
            username
            email
          }
        }
      }
    `;

    try {
      const response = await graphqlClient.request(query, { status: statusFilter });
      return response.allOrders;
    } catch (error) {
      console.error('Error al obtener todas las órdenes:', error);
      throw error;
    }
  }
};

export default orderService;
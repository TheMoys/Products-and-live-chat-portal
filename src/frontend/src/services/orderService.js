import axios from 'axios';
import { gql } from '@apollo/client';
import graphqlClient from './graphqlClient';

const API_URL = 'http://localhost:3000/api/orders';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// GraphQL Queries
const GET_MY_ORDERS = gql`
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
          image
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

const GET_ORDER_DETAIL = gql`
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
          image
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

const CREATE_ORDER_MUTATION = gql`
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

export const orderService = {
  // Crear pedido (REST)
  async createOrderREST(shippingAddress) {
    try {
      const response = await axios.post(
        API_URL,
        { shippingAddress },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Crear pedido (GraphQL) - USADO POR DEFECTO
  async createOrder(shippingAddress) {
    try {
      const { data } = await graphqlClient.mutate({
        mutation: CREATE_ORDER_MUTATION,
        variables: { shippingAddress },
      });
      return data.createOrder;
    } catch (error) {
      throw error;
    }
  },

  // Obtener mis pedidos (GraphQL)
  async getMyOrders() {
    try {
      const { data } = await graphqlClient.query({
        query: GET_MY_ORDERS,
      });
      return data.myOrders;
    } catch (error) {
      throw error;
    }
  },

  // Obtener detalle de pedido (GraphQL)
  async getOrderDetail(orderId) {
    try {
      const { data } = await graphqlClient.query({
        query: GET_ORDER_DETAIL,
        variables: { id: orderId },
      });
      return data.order;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los pedidos - ADMIN (REST)
  async getAllOrders(status = null) {
    try {
      const url = status ? `${API_URL}?status=${status}` : API_URL;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar estado de pedido - ADMIN (REST)
  async updateOrderStatus(orderId, status) {
    try {
      const response = await axios.put(
        `${API_URL}/${orderId}/status`,
        { status },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
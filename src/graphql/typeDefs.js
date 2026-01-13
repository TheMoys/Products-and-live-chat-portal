const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type Product {
    id: ID!
    title: String!
    description: String!
    price: Float!
    category: String!
    stock: Int!
    imageUrl: String
    imageData: String
    createdAt: String!
  }

  type CartItem {
    product: Product!
    quantity: Int!
    price: Float!
  }

  type Cart {
    id: ID!
    user: User!
    items: [CartItem!]!
    updatedAt: String!
    totalAmount: Float
  }

  type OrderItem {
    product: Product!
    title: String!
    quantity: Int!
    price: Float!
  }

  type ShippingAddress {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  type Order {
    id: ID!
    orderNumber: String!
    user: User!
    items: [OrderItem!]!
    totalAmount: Float!
    status: OrderStatus!
    shippingAddress: ShippingAddress
    createdAt: String!
    updatedAt: String!
  }

  enum OrderStatus {
    pending
    processing
    shipped
    delivered
    cancelled
  }

  type OrderStats {
    total: Int!
    pending: Int!
    processing: Int!
    shipped: Int!
    delivered: Int!
    cancelled: Int!
    totalRevenue: Float!
  }

  input ShippingAddressInput {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  type Query {
    # Productos
    products(category: String, search: String): [Product!]!
    product(id: ID!): Product
    
    # Carrito
    getCart: Cart
    
    # Pedidos
    myOrders: [Order!]!
    order(id: ID!): Order
    allOrders(status: OrderStatus): [Order!]!
    orderStats: OrderStats! 
  }

  type Mutation {
    # Carrito
    addToCart(productId: ID!, quantity: Int!): Cart!
    updateCartItem(productId: ID!, quantity: Int!): Cart!
    removeFromCart(productId: ID!): Cart!
    clearCart: Boolean!
    
    # Pedidos
    createOrder(shippingAddress: ShippingAddressInput!): Order!
    updateOrderStatus(orderId: ID!, status: OrderStatus!): Order!
  }
`;

module.exports = typeDefs;
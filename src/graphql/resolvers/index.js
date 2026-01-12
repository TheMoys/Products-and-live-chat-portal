const productResolvers = require('./productResolvers');
const cartResolvers = require('./cartResolvers');
const orderResolvers = require('./orderResolvers');

const resolvers = {
  Query: {
    ...productResolvers.Query,
    ...cartResolvers.Query,
    ...orderResolvers.Query
  },
  Mutation: {
    ...cartResolvers.Mutation,
    ...orderResolvers.Mutation
  }
};

module.exports = resolvers;
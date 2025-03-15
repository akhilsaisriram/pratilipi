const { gql } = require('graphql-tag');
const { UserService } = require('../services/user_service');

const typeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    preferences: Preferences
    createdAt: String
    updatedAt: String
  }

  type Preferences {
    promotions: Boolean
    order_updates: Boolean
    recommendations: Boolean
  }

  input PreferencesInput {
    promotions: Boolean
    order_updates: Boolean
    recommendations: Boolean
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    preferences: PreferencesInput
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    preferences: PreferencesInput
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  type AuthResponse {
    user: User!
    token: String!
  }

  type Query {
    getUser: User
  }

  type Mutation {
    register(input: RegisterInput!): User!
    login(input: LoginInput!): AuthResponse!
    updateUser(input: UpdateUserInput!): User!
    deleteUser: Message!
    changePassword(input: ChangePasswordInput!): Message!
  }

  type Message {
    message: String!
  }
`;

const resolvers = {
  Query: {
    getUser: async (_, __, { token }) => {
    
      const userService = new UserService(token);
      const response = await userService.getUser();
      return response.data;
    }
  },
  Mutation: {
    register: async (_, { input }) => {
      const userService = new UserService();
      const response = await userService.register(input);
      return response;
    },
    login: async (_, { input }) => {
      const userService = new UserService();
      return await userService.login(input);
    },
    updateUser: async (_, { input }, { token }) => {
      const userService = new UserService(token);
      const response = await userService.updateUser(input);
      return response.data;
    },
    deleteUser: async (_, __, { token }) => {
      const userService = new UserService(token);
      return await userService.deleteUser();
    },
    changePassword: async (_, { input }, { token }) => {
      const userService = new UserService(token);
      return await userService.changePassword(input);
    }
  }
};

module.exports = { typeDefs, resolvers };

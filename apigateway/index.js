const express = require('express');
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { typeDefs, resolvers } = require('./schema/schema_user');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  
  // Create GraphQL schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  });

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  
  // Middleware
  app.use(
    '/graphql',
    cors(),
    express.json(),
    morgan('dev'),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        token: req.headers.authorization || ''
      })
    })
  );

  // Health check endpoint
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'GraphQL API Gateway is running' });
  });

  const PORT = process.env.PORT || 8080;
  await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));
  console.log(`API Gateway running on port ${PORT}, GraphQL endpoint at http://localhost:${PORT}/graphql`);
}

startServer().catch(err => console.error('Error starting server:', err));

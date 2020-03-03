const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const {
  ApolloServer,
  PubSub
} = require("apollo-server-express");
const typeDefs = require("./schema");
const resolvers = require("./resolver");
const http = require("http");

const pubsub = new PubSub();
const PORT = 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    pubsub
  },
  subscriptions: {
    onConnect: (connectionParams, webSocket) => {
      console.log("connected!");
      console.log("connectionParams:", connectionParams);
      //throw new Error("Missing auth token!");
    }
  }
});

const app = express();

server.applyMiddleware({ app });

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 4000 }, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  );
});

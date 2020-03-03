const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: String!
    displayName: String
  }

  type Message {
    id: String!
    from: String!
    timestamp: String!
    text: String!
    read: Boolean!
  }

  type Chat {
    id: String!
    users: [User]
    type: String!
    messages: [Message]
    messageCount: Int
  }

  type Query {
    chats(userId: String!): [Chat]
    chat(chatId: String!): Chat
    users: [User]
    user(userId: String!): User
  }

  type Mutation {
    sendMessage(from: String!, to: String!, text: String!): Message
    createChat(userList: [String]!): String
  }

  type Subscription {
    messageSent(chatId: String!): Message
    chatChanges(userId: String!): [Chat]
  }
`;

module.exports = typeDefs;

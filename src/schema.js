const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    displayName: String!
    email: String!
    photo: Link
  }

  type Link {
    id: ID!
    url: String!
  }

  type Read {
    id: ID!
    timestamp: Int!
    user: User!
  }

  type Message {
    id: ID!
    from: User!
    timestamp: Int!
    text: String!
  }

  type MessageTree {
    id: ID!
    message: Message!
    read: [Read]!
    children: [MessageTree]!
  }

  type Chat {
    id: ID!
    chatName: String
    users: [User]!
    messages: MessageTree!
  }

  type Query {
    chats(userId: ID!): [Chat]!
    chat(chatId: ID!): Chat
    user(userId: ID!): User
  }

  type Mutation {
    createChat(
      userId: ID!
      chatName: String
      participants: [ID!]!
      text: String!
    ): Boolean
    sendMessage(userId: ID!, chatId: ID!, text: String!): Boolean
    changeChatName(chatId: ID!, chatName: String!): String
  }

  type Subscription {
    messageSent(chatId: String!): Message
    chatChanges(userId: String!): [Chat]
  }
`;

module.exports = typeDefs;

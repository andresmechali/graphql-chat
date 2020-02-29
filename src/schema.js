const typeDefs = `
  type Message {
    id: String!
    from: String!
    text: String!
  }

  type Chat {
    id: Int!
    displayName: String!
    messages: [Message]
  }

  type Query {
    chats: [Chat]
    chat(chatId: Int!): Chat
  }

  type Mutation {
    sendMessage(chatId: Int!, from: String!, text: String!): [Chat]
  }

  type Subscription {
    messageSent: Chat
  }
`

module.exports = typeDefs

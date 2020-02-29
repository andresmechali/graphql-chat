const admin = require('firebase-admin');
const secrets = require('./secrets/dos-comas-firebase-adminsdk-1unx6-6bac04af2f');

const generateMessages = require("./utils/generateMessages");

const chats = generateMessages();

const CHAT_CHANNEL = "CHAT_CHANNEL";

const resolvers = {
  Query: {
    chats(root, args, context) {
      return chats;
    },
    chat(root, { chatId }, context) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        return chat;
      } else {
        return chats[0];
      }
    }
  },

  Mutation: {
    sendMessage(root, { chatId, from, text }, { pubsub }) {
      const chatIndex = chats.findIndex(c => c.id === chatId);

      const messageSent = {
        id: Math.random().toString(),
        from,
        text
      };

      if (chatIndex > -1) {
        chats[chatIndex].messages.push(messageSent);

        pubsub.publish("CHAT_CHANNEL", { messageSent });
      }

      return chats;
    }
  },

  Subscription: {
    messageSent: {
      subscribe(root, args, { pubsub }) {
        return pubsub.asyncIterator(CHAT_CHANNEL);
      }
    }
  }
};

module.exports = resolvers;

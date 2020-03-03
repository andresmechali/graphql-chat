const admin = require("firebase-admin");
const serviceAccount = require("./secrets/dos-comas-firebase-adminsdk-1unx6-6bac04af2f");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dos-comas.firebaseio.com"
});

const db = admin.firestore();

const chatsCollection = db.collection("chats");
const usersCollections = db.collection("users");

const CHAT_CHANNEL = "CHAT_CHANNEL";

const getAllChats = userId => {
  const userReference = usersCollections.doc(userId);
  return chatsCollection
    .where("users", "array-contains", userReference)
    .where("messageCount", ">", 0)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log("doesnt exist");
        return;
      }
      const chats = snapshot.docs;
      return chats.map(chat => {
        const chatData = chat.data();
        return Promise.all(chatData.users.map(user => user.get())).then(res => {
          const users = res.map(user => ({
            id: user.id,
            ...user.data()
          }));
          return {
            id: chat.id,
            ...chatData,
            users
          };
        });
      });
    })
    .catch(e => {
      console.log("Error getting data =>", e);
      return [];
    });
};

const resolvers = {
  Query: {
    chats(root, { userId }, context) {
      return getAllChats(userId);
    },
    chat(root, { chatId }, context) {
      return chatsCollection
        .doc(chatId)
        .get()
        .then(snapshot => {
          if (!snapshot.exists) {
            return;
          }
          const chat = snapshot.data();
          return Promise.all(chat.users.map(user => user.get())).then(res => {
            const users = res.map(user => ({
              id: user.id,
              ...user.data()
            }));
            return {
              id: snapshot.id,
              ...chat,
              users
            };
          });
        })
        .catch(e => {
          console.log("error", e);
          return [];
        });
    },
    users(obj, args, context, info) {
      return usersCollections.get().then(snapshot => {
        if (snapshot.empty) {
          return;
        }
        const users = snapshot.docs;
        return users.map(user => ({
          id: user.id || Math.random().toString(),
          ...user.data()
        }));
      });
    },
    user(obj, { userId }, context, info) {
      return usersCollections
        .doc(userId)
        .get()
        .then(snapshot => {
          if (snapshot.exists) {
            console.log("User -> ", snapshot.data());
            return {
              id: userId,
              ...snapshot.data()
            };
          }
        });
    }
  },

  Mutation: {
    sendMessage(root, { from, to, text }, { pubsub }) {
      const message = {
        id: Math.random().toString(),
        from,
        text,
        timestamp: new Date().toString(),
        read: false
      };
      return chatsCollection
        .doc(to)
        .update({
          messages: admin.firestore.FieldValue.arrayUnion(message),
          messageCount: admin.firestore.FieldValue.increment(1)
        })
        .then(res => {
          console.log("res", res);
          pubsub.publish("CHAT_CHANNEL", message);
          return message;
        })
        .catch(e => {
          console.log("error adding message");
          console.log(e);
        });
    },
    createChat(root, { userList }, { pubsub }) {
      const users = userList.map(user => usersCollections.doc(user));
      return chatsCollection
        .add({
          users,
          type: users.length <= 2 ? "single" : "group",
          messages: [],
          messageCount: 0
        })
        .then(ref => {
          const allChats = getAllChats(userList[0]);
          pubsub.publish(CHAT_CHANNEL, allChats);
          return ref.id;
        });
    }
  },

  Subscription: {
    messageSent: {
      subscribe(root, args, { pubsub }) {
        return pubsub.asyncIterator(CHAT_CHANNEL);
      },
      resolve: (payload, args, context, info) => {
        return payload;
      }
    },
    chatChanges: {
      subscribe(root, args, { pubsub }) {
        return pubsub.asyncIterator(CHAT_CHANNEL);
      },
      resolve(payload) {
        return payload;
      }
    }
  }
};

module.exports = resolvers;

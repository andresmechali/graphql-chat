const casual = require("casual");

const assignSender = other => {
  if (Math.random() < 0.5) {
    return "0";
  }
  return other;
};

const assignNumberOfMessages = () => {
  const number = Math.round(20 * Math.random());
  if (number === 0) {
    return 1;
  }
  return number;
};

const assignId = () => Math.random().toString();

const generateChat = () => {
  const userId = Math.floor(10000 * Math.random());
  const messages = [];
  const numberOfMessages = assignNumberOfMessages();
  for (let i = 0; i < numberOfMessages; i += 1) {
    messages.push({
      id: assignId(),
      from: assignSender(userId),
      text: casual.words(Math.floor(30 * Math.random()))
    });
  }

  return {
    id: userId,
    displayName: `${casual.first_name} ${casual.last_name}`,
    messages
  };
};

const generateMessages = () => {
  const messages = [];
  for (let i = 0; i < 6; i += 1) {
    messages.push(generateChat());
  }
  return messages;
};

module.exports = generateMessages;

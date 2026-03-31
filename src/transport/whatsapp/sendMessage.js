async function sendMessage(client, chatId, text) {
  if (!client || !chatId || !text) return null;
  return client.sendMessage(chatId, text);
}

module.exports = { sendMessage };

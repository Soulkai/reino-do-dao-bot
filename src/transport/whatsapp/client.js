const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { routeMessage } = require('./messageRouter');

function createWhatsAppClient() {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    console.log('Escaneie o QR Code abaixo:');
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    console.log('Autenticação concluída.');
  });

  client.on('ready', () => {
    console.log('Bot conectado ao WhatsApp e pronto.');
  });

  client.on('message', async (msg) => {
    await routeMessage(client, msg);
  });

  client.on('auth_failure', (message) => {
    console.error('Falha de autenticação:', message);
  });

  client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
  });

  return client;
}

module.exports = { createWhatsAppClient };

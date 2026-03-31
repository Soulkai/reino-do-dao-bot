const { runMigrations } = require('./infra/db/runMigrations');
const { createWhatsAppClient } = require('./transport/whatsapp/client');
const { env } = require('./config');

async function bootstrap() {
  console.log(`[boot] iniciando ${env.appName}`);
  runMigrations();
  const client = createWhatsAppClient();
  await client.initialize();
}

bootstrap().catch((error) => {
  console.error('[boot:error]', error);
  process.exit(1);
});

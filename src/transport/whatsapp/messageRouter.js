const { parseCommand } = require('../../application/commandParser');
const { getHandler } = require('../../application/commandRegistry');
const { env, constants } = require('../../config');
const { getDb } = require('../../infra/db/connection');
const { randomUUID, createHash } = require('crypto');

const cooldownCache = new Map();

function getSenderPhone(msg) {
  const raw = msg.author || msg.from || '';
  return raw.replace(/@.+$/, '');
}

function nowMs() {
  return Date.now();
}

function buildContext(msg, parsed) {
  return {
    correlationId: randomUUID(),
    rawText: parsed.rawText,
    commandName: parsed.commandName,
    args: parsed.args,
    senderPhone: getSenderPhone(msg),
    senderDisplayName: msg._data?.notifyName || msg._data?.pushname || '',
    chatId: msg.from,
    sourceType: msg.from.endsWith('@g.us') ? 'group' : 'private',
    timestamp: new Date().toISOString(),
    commandHash: createHash('sha1').update(parsed.rawText).digest('hex')
  };
}

function checkCooldown(ctx) {
  const seconds = constants.cooldowns[ctx.commandName] ?? 2;
  if (seconds <= 0) return null;
  const key = `${ctx.senderPhone}:${ctx.commandName}`;
  const last = cooldownCache.get(key);
  const current = nowMs();
  if (last && current - last < seconds * 1000) {
    const wait = Math.ceil((seconds * 1000 - (current - last)) / 1000);
    return wait;
  }
  cooldownCache.set(key, current);
  return null;
}

async function routeMessage(client, msg) {
  if (!msg.body || typeof msg.body !== 'string') return;
  if (msg.from.endsWith('@g.us') && !env.enableGroups) return;
  if (!msg.from.endsWith('@g.us') && !env.enablePrivateChat) return;

  const parsed = parseCommand(msg.body, env.botPrefix);
  if (!parsed) return;

  const ctx = buildContext(msg, parsed);
  const waitSeconds = checkCooldown(ctx);
  if (waitSeconds) {
    await client.sendMessage(msg.from, `Espere ${waitSeconds}s para usar /${ctx.commandName} novamente.`);
    return;
  }

  try {
    const handler = getHandler(ctx.commandName);
    const result = await handler(ctx);
    await client.sendMessage(msg.from, result.message || 'Sem resposta.');

    const db = getDb();
    db.prepare('UPDATE players SET last_command_at = CURRENT_TIMESTAMP WHERE phone_number = ?').run(ctx.senderPhone);
  } catch (error) {
    console.error('[router:error]', error);
    await client.sendMessage(msg.from, 'Ocorreu um erro ao processar esse comando.');
  }
}

module.exports = { routeMessage };

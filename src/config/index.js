require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'reino-do-dao-bot',
  botPrefix: process.env.BOT_PREFIX || '/',
  dbPath: process.env.DB_PATH || './data/game.sqlite',
  logLevel: process.env.LOG_LEVEL || 'info',
  timezone: process.env.TIMEZONE || 'America/Campo_Grande',
  defaultMessageCooldownMs: Number(process.env.MESSAGE_COOLDOWN_DEFAULT_MS || 1500),
  enableGroups: String(process.env.ENABLE_GROUPS || 'true') === 'true',
  enablePrivateChat: String(process.env.ENABLE_PRIVATE_CHAT || 'true') === 'true',
  adminPhone: process.env.ADMIN_PHONE || ''
};

const constants = {
  cultivationPaths: ['corpo', 'espirito', 'alma'],
  currencies: {
    gold: 'gold',
    spiritStones: 'spirit_stones',
    destinyPoints: 'destiny_points'
  },
  playerStatus: {
    ACTIVE: 'active',
    DEAD: 'dead',
    SEALED: 'sealed',
    BANNED: 'banned'
  },
  cooldowns: {
    registrar: 0,
    perfil: 3,
    status: 3,
    inventario: 4,
    cultivar: 30,
    explorar: 45,
    loja: 4,
    comprar: 5,
    ajuda: 2
  }
};

const balance = {
  baseCultivationXp: {
    corpo: 12,
    espirito: 12,
    alma: 11
  },
  explorationWeights: [
    { type: 'nothing', weight: 12 },
    { type: 'resource_common', weight: 25 },
    { type: 'resource_uncommon', weight: 15 },
    { type: 'monster_common', weight: 16 },
    { type: 'monster_elite', weight: 6 },
    { type: 'npc', weight: 8 },
    { type: 'herb', weight: 7 },
    { type: 'ore', weight: 4 },
    { type: 'treasure', weight: 3 },
    { type: 'ambush', weight: 2 },
    { type: 'encounter', weight: 1.5 },
    { type: 'ruin', weight: 0.4 },
    { type: 'inheritance', weight: 0.1 }
  ]
};

module.exports = { env, constants, balance };

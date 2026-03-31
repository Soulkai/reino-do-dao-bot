const { constants } = require('../config');
const { playerService, cultivationService, explorationService, shopService } = require('./services');

function formatBlock(title, summary, bullets = [], next = []) {
  const bulletText = bullets.length ? `\n${bullets.map((b) => `• ${b}`).join('\n')}` : '';
  const nextText = next.length ? `\n\nPróximos comandos: ${next.join(' ')}` : '';
  return `[${title}]\n${summary}${bulletText}${nextText}`;
}

const handlers = {
  ajuda: async () => ({
    ok: true,
    message: formatBlock(
      'AJUDA',
      'Comandos principais do Reino do Dao.',
      [
        '/registrar Nome Sexo',
        '/perfil',
        '/status',
        '/cultivar corpo|espirito|alma',
        '/explorar',
        '/loja',
        '/comprar CODIGO [qtd]',
        '/inventario'
      ]
    )
  }),

  registrar: async (ctx) => {
    if (!ctx.args[0] || !ctx.args[1]) {
      return { ok: false, message: 'Uso: /registrar Nome Sexo' };
    }
    const characterName = ctx.args[0].trim();
    const sex = ctx.args[1].trim();
    const result = playerService.register({
      phone: ctx.senderPhone,
      displayName: ctx.senderDisplayName,
      characterName,
      sex,
      sourceContext: ctx.sourceType,
      sourceChatId: ctx.chatId,
      commandText: ctx.rawText,
      correlationId: ctx.correlationId
    });

    if (!result.ok) return { ok: false, message: result.error };
    const data = result.data;
    return {
      ok: true,
      message: formatBlock(
        'REGISTRO CONCLUÍDO',
        'Seu personagem foi criado com sucesso.',
        [
          `Nome: ${data.characterName}`,
          `Raça: ${data.raceName}`,
          `Clã: ${data.clanName}`,
          `Talento: ${data.talentTier}`,
          `Raiz Espiritual: ${data.rootName}`,
          `Corpo Especial: ${data.divineBodyName}`,
          `Região Inicial: ${data.regionName}`
        ],
        ['/perfil', '/status', '/cultivar espirito']
      )
    };
  },

  perfil: async (ctx) => {
    const profile = playerService.getFullProfileByPhone(ctx.senderPhone);
    if (!profile) return { ok: false, message: 'Você ainda não possui personagem. Use /registrar Nome Sexo' };
    const c = Object.fromEntries(profile.cultivation.map((row) => [row.path_type, row]));
    return {
      ok: true,
      message: formatBlock(
        'PERFIL',
        `${profile.player.character_name}, cultivador do Reino do Dao.`,
        [
          `Raça: ${profile.player.race_name}`,
          `Clã: ${profile.player.clan_name}`,
          `Talento: ${profile.player.talent_tier}`,
          `Raiz: ${profile.player.root_name || 'Sem raiz desperta'}`,
          `Corpo Especial: ${profile.player.divine_body_name || 'Nenhum'}`,
          `Corpo: ${c.corpo?.realm_index || 1}/${c.corpo?.sublevel || 1} | Espírito: ${c.espirito?.realm_index || 1}/${c.espirito?.sublevel || 1} | Alma: ${c.alma?.realm_index || 1}/${c.alma?.sublevel || 1}`,
          `Região: ${profile.player.region_name}`
        ],
        ['/status', '/cultivar espirito', '/explorar']
      )
    };
  },

  status: async (ctx) => {
    const profile = playerService.getFullProfileByPhone(ctx.senderPhone);
    if (!profile) return { ok: false, message: 'Você ainda não possui personagem. Use /registrar Nome Sexo' };
    const a = profile.attrs;
    const w = profile.wallet;
    return {
      ok: true,
      message: formatBlock(
        'STATUS',
        'Estado atual do seu personagem.',
        [
          `HP: ${a.hp_current}/${a.hp_max}`,
          `Qi: ${a.qi_current}/${a.qi_max}`,
          `Alma: ${a.soul_current}/${a.soul_max}`,
          `Fadiga: ${a.fatigue}`,
          `Ouro: ${w.gold}`,
          `Pedras Espirituais: ${w.spirit_stones}`,
          `Pontos do Destino: ${w.destiny_points}`
        ],
        ['/perfil', '/cultivar corpo', '/loja']
      )
    };
  },

  inventario: async (ctx) => {
    const player = playerService.findByPhone(ctx.senderPhone);
    if (!player) return { ok: false, message: 'Você ainda não possui personagem. Use /registrar Nome Sexo' };
    const items = playerService.getInventory(player.id);
    if (!items.length) {
      return { ok: true, message: formatBlock('INVENTÁRIO', 'Seu inventário está vazio.', [], ['/explorar', '/loja']) };
    }
    return {
      ok: true,
      message: formatBlock(
        'INVENTÁRIO',
        'Itens em sua posse.',
        items.slice(0, 10).map((item) => `${item.name} x${item.quantity} [${item.code}]`),
        ['/loja', '/comprar basic_recovery_pill']
      )
    };
  },

  cultivar: async (ctx) => {
    const player = playerService.findByPhone(ctx.senderPhone);
    if (!player) return { ok: false, message: 'Você ainda não possui personagem. Use /registrar Nome Sexo' };
    const pathType = (ctx.args[0] || '').toLowerCase();
    if (!constants.cultivationPaths.includes(pathType)) {
      return { ok: false, message: 'Uso: /cultivar corpo|espirito|alma' };
    }
    const result = cultivationService.cultivate({
      playerId: player.id,
      pathType,
      sourceContext: ctx.sourceType,
      sourceChatId: ctx.chatId,
      commandText: ctx.rawText,
      correlationId: ctx.correlationId
    });
    if (!result.ok) return { ok: false, message: result.error };
    const d = result.data;
    return {
      ok: true,
      message: formatBlock(
        'CULTIVO',
        `Você cultivou a trilha de ${d.pathType}.`,
        [
          `XP ganho: +${d.gainedXp}${d.bonusXp ? ` (+${d.bonusXp} por epifania)` : ''}`,
          `Fadiga: +${d.fatigueGain}`,
          `Epifania: ${d.hadEpiphany ? 'ocorreu' : 'não ocorreu'}`,
          `Progresso: Reino ${d.realmIndex} ${d.sublevel}/9`
        ],
        ['/status', `/cultivar ${d.pathType}`, '/explorar']
      )
    };
  },

  explorar: async (ctx) => {
    const player = playerService.findByPhone(ctx.senderPhone);
    if (!player) return { ok: false, message: 'Você ainda não possui personagem. Use /registrar Nome Sexo' };
    const result = explorationService.explore({
      playerId: player.id,
      sourceContext: ctx.sourceType,
      sourceChatId: ctx.chatId,
      commandText: ctx.rawText,
      correlationId: ctx.correlationId
    });
    if (!result.ok) return { ok: false, message: result.error };
    return { ok: true, message: formatBlock(result.data.title, result.data.summary, result.data.bullets, ['/inventario', '/explorar', '/mercado']) };
  },

  loja: async () => {
    const items = shopService.listShopItems();
    return {
      ok: true,
      message: formatBlock(
        'LOJA DO BOT',
        'Itens disponíveis na loja oficial.',
        items.slice(0, 10).map((item) => `${item.name} [${item.code}] - ${item.price_amount} ${item.currency}`),
        ['/comprar spirit_herb_common 1', '/comprar basic_recovery_pill 1']
      )
    };
  },

  comprar: async (ctx) => {
    const player = playerService.findByPhone(ctx.senderPhone);
    if (!player) return { ok: false, message: 'Você ainda não possui personagem. Use /registrar Nome Sexo' };
    const itemCode = ctx.args[0];
    const quantity = ctx.args[1] || 1;
    if (!itemCode) return { ok: false, message: 'Uso: /comprar CODIGO [quantidade]' };
    const result = shopService.buy({
      playerId: player.id,
      itemCode,
      quantity,
      sourceContext: ctx.sourceType,
      sourceChatId: ctx.chatId,
      commandText: ctx.rawText,
      correlationId: ctx.correlationId
    });
    if (!result.ok) return { ok: false, message: result.error };
    const d = result.data;
    return {
      ok: true,
      message: formatBlock(
        'COMPRA CONCLUÍDA',
        'A compra na loja do bot foi realizada com sucesso.',
        [
          `Item: ${d.itemName}`,
          `Quantidade: ${d.quantity}`,
          `Preço total: ${d.totalPrice} ${d.currency}`
        ],
        ['/inventario', '/status', '/loja']
      )
    };
  },

  defaultPlaceholder: async (ctx) => ({
    ok: true,
    message: formatBlock('EM CONSTRUÇÃO', `O comando /${ctx.commandName} ainda está no roadmap do bot.`, [], ['/ajuda'])
  })
};

module.exports = { handlers };

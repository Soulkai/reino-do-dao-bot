const { getDb } = require('../infra/db/connection');
const { balance } = require('../config');
const { randomUUID } = require('crypto');

function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function sampleWeighted(entries) {
  const total = entries.reduce((acc, item) => acc + Number(item.weight || 0), 0);
  let roll = Math.random() * total;
  for (const item of entries) {
    roll -= Number(item.weight || 0);
    if (roll <= 0) return item;
  }
  return entries[entries.length - 1];
}

function randomOf(rows) {
  return rows[Math.floor(Math.random() * rows.length)];
}

const logService = {
  write(payload) {
    const db = getDb();
    db.prepare(`
      INSERT INTO game_logs (
        severity, service_name, event_type, action, player_id, target_player_id, sect_id, region_id,
        source_context, source_chat_id, command_text, payload_json, result_json, status, error_message,
        execution_ms, correlation_id, command_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payload.severity || 'info',
      payload.serviceName || 'app',
      payload.eventType || 'generic',
      payload.action || 'unknown',
      payload.playerId || null,
      payload.targetPlayerId || null,
      payload.sectId || null,
      payload.regionId || null,
      payload.sourceContext || 'system',
      payload.sourceChatId || null,
      payload.commandText || null,
      JSON.stringify(payload.payload || {}),
      JSON.stringify(payload.result || {}),
      payload.status || 'success',
      payload.errorMessage || null,
      payload.executionMs || null,
      payload.correlationId || randomUUID(),
      payload.commandHash || null
    );
  }
};

const playerService = {
  findByPhone(phone) {
    const db = getDb();
    return db.prepare('SELECT * FROM players WHERE phone_number = ?').get(phone);
  },

  getFullProfileByPhone(phone) {
    const db = getDb();
    const player = db.prepare(`
      SELECT p.*, r.name AS race_name, c.name AS clan_name, sr.name AS root_name, dbd.name AS divine_body_name, rg.name AS region_name
      FROM players p
      JOIN races r ON r.id = p.race_id
      JOIN clans c ON c.id = p.clan_id
      LEFT JOIN spiritual_roots sr ON sr.id = p.spiritual_root_id
      LEFT JOIN divine_bodies dbd ON dbd.id = p.divine_body_id
      JOIN regions rg ON rg.id = p.region_id
      WHERE p.phone_number = ?
    `).get(phone);
    if (!player) return null;

    const attrs = db.prepare('SELECT * FROM player_attributes WHERE player_id = ?').get(player.id);
    const cultivation = db.prepare('SELECT path_type, realm_index, sublevel, xp_current FROM player_cultivation WHERE player_id = ?').all(player.id);
    const wallet = db.prepare('SELECT * FROM wallet_balances WHERE player_id = ?').get(player.id);
    return { player, attrs, cultivation, wallet };
  },

  register({ phone, displayName, characterName, sex, sourceContext, sourceChatId, commandText, correlationId }) {
    const db = getDb();
    const existing = db.prepare('SELECT id FROM players WHERE phone_number = ? OR character_name = ?').get(phone, characterName);
    if (existing) {
      return { ok: false, error: 'Você já possui personagem ou esse nome já está em uso.' };
    }

    const races = db.prepare('SELECT * FROM races').all();
    const clans = db.prepare('SELECT * FROM clans').all();
    const roots = db.prepare('SELECT * FROM spiritual_roots').all();
    const bodies = db.prepare('SELECT * FROM divine_bodies').all();
    const regions = db.prepare('SELECT * FROM regions ORDER BY id ASC').all();

    const race = randomOf(races);
    const clan = randomOf(clans);
    const root = Math.random() < 0.92 ? randomOf(roots) : null;
    const divineBody = Math.random() < 0.11 ? randomOf(bodies) : null;
    const talentTier = sampleWeighted([
      { value: 'Comum', weight: 35 },
      { value: 'Incomum', weight: 25 },
      { value: 'Raro', weight: 18 },
      { value: 'Épico', weight: 11 },
      { value: 'Lendário', weight: 6 },
      { value: 'Celestial', weight: 4 },
      { value: 'Inominável', weight: 1 }
    ]).value;
    const luckTier = sampleWeighted([
      { value: 'Muito baixa', weight: 10 },
      { value: 'Baixa', weight: 20 },
      { value: 'Média', weight: 40 },
      { value: 'Alta', weight: 20 },
      { value: 'Excepcional', weight: 8 },
      { value: 'Destino Abençoado', weight: 2 }
    ]).value;
    const region = regions[0];

    const tx = db.transaction(() => {
      const playerResult = db.prepare(`
        INSERT INTO players (
          phone_number, display_name, character_name, sex, age, race_id, clan_id,
          talent_tier, spiritual_root_id, divine_body_id, luck_tier, region_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `).run(
        phone,
        displayName || null,
        characterName,
        sex,
        16 + Math.floor(Math.random() * 5),
        race.id,
        clan.id,
        talentTier,
        root ? root.id : null,
        divineBody ? divineBody.id : null,
        luckTier,
        region.id
      );

      const playerId = playerResult.lastInsertRowid;
      db.prepare(`
        INSERT INTO player_attributes (
          player_id, strength, agility, constitution, intelligence, perception,
          spirit, comprehension, luck, charisma, willpower,
          hp_current, hp_max, qi_current, qi_max,
          body_energy_current, body_energy_max, soul_current, soul_max, fatigue
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `).run(playerId, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 100, 100, 50, 50, 50, 50, 50, 50);

      for (const pathType of ['corpo', 'espirito', 'alma']) {
        db.prepare(`
          INSERT INTO player_cultivation (player_id, path_type, realm_index, sublevel, xp_current, instability)
          VALUES (?, ?, 1, 1, 0, 0)
        `).run(playerId, pathType);
      }

      db.prepare(`
        INSERT INTO wallet_balances (player_id, gold, spirit_stones, celestial_crystals, merit, destiny_points)
        VALUES (?, 120, 10, 0, 0, 1)
      `).run(playerId);

      const basicRecoveryItem = db.prepare(`SELECT id FROM items WHERE code = 'basic_recovery_pill'`).get();
      if (basicRecoveryItem) {
        const instance = db.prepare(`INSERT INTO item_instances (item_id, quality_tier, origin_type, metadata_json) VALUES (?, 'comum', 'system', '{}')`).run(basicRecoveryItem.id);
        db.prepare(`INSERT INTO player_inventory (player_id, item_instance_id, quantity, is_bound) VALUES (?, ?, 3, 0)`).run(playerId, instance.lastInsertRowid);
      }

      logService.write({
        serviceName: 'player',
        eventType: 'player_register',
        action: 'register',
        playerId,
        sourceContext,
        sourceChatId,
        commandText,
        correlationId,
        payload: { phone, characterName, sex },
        result: { race: race.name, clan: clan.name, root: root?.name || null, divineBody: divineBody?.name || null },
        status: 'success'
      });
    });

    tx();

    return {
      ok: true,
      data: {
        characterName,
        sex,
        raceName: race.name,
        clanName: clan.name,
        rootName: root ? root.name : 'Sem raiz desperta',
        divineBodyName: divineBody ? divineBody.name : 'Nenhum',
        talentTier,
        luckTier,
        regionName: region.name
      }
    };
  },

  getInventory(playerId) {
    const db = getDb();
    return db.prepare(`
      SELECT pi.id, pi.quantity, i.code, i.name, i.item_type, i.rarity, ii.quality_tier
      FROM player_inventory pi
      JOIN item_instances ii ON ii.id = pi.item_instance_id
      JOIN items i ON i.id = ii.item_id
      WHERE pi.player_id = ?
      ORDER BY i.name ASC
    `).all(playerId);
  }
};

const cultivationService = {
  cultivate({ playerId, pathType, sourceContext, sourceChatId, commandText, correlationId }) {
    const db = getDb();
    const path = db.prepare('SELECT * FROM player_cultivation WHERE player_id = ? AND path_type = ?').get(playerId, pathType);
    const attrs = db.prepare('SELECT * FROM player_attributes WHERE player_id = ?').get(playerId);
    if (!path || !attrs) return { ok: false, error: 'Estado de cultivo não encontrado.' };

    const baseXp = balance.baseCultivationXp[pathType] || 10;
    const spiritMod = 1 + (attrs.spirit / 200);
    const compMod = 1 + (attrs.comprehension / 250);
    const fatigueMod = Math.max(0.65, 1 - (attrs.fatigue / 200));
    const gainedXp = Math.max(4, Math.round(baseXp * spiritMod * compMod * fatigueMod));
    const fatigueGain = pathType === 'corpo' ? 4 : 3;
    const nextXp = path.xp_current + gainedXp;
    const threshold = Math.round(100 * (1 + (path.sublevel - 1) * 0.22) * path.realm_index);

    let newSublevel = path.sublevel;
    let remainingXp = nextXp;
    if (nextXp >= threshold && path.sublevel < 9) {
      newSublevel += 1;
      remainingXp = nextXp - threshold;
    }

    const epiphanyChance = pathType === 'espirito' ? 0.0125 : 0.008;
    const hadEpiphany = Math.random() < epiphanyChance * (1 + attrs.spirit / 150);
    const bonusXp = hadEpiphany ? Math.max(5, Math.round(gainedXp * 0.75)) : 0;

    db.prepare(`
      UPDATE player_cultivation
      SET sublevel = ?, xp_current = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newSublevel, remainingXp + bonusXp, path.id);

    db.prepare(`
      UPDATE player_attributes
      SET fatigue = MIN(100, fatigue + ?), qi_current = MAX(0, qi_current - 2), updated_at = CURRENT_TIMESTAMP
      WHERE player_id = ?
    `).run(fatigueGain, playerId);

    logService.write({
      serviceName: 'cultivation',
      eventType: 'cultivation',
      action: `cultivate_${pathType}`,
      playerId,
      sourceContext,
      sourceChatId,
      commandText,
      correlationId,
      payload: { pathType },
      result: { gainedXp, bonusXp, newSublevel, hadEpiphany },
      status: 'success'
    });

    return {
      ok: true,
      data: {
        pathType,
        gainedXp,
        bonusXp,
        hadEpiphany,
        sublevel: newSublevel,
        realmIndex: path.realm_index,
        fatigueGain
      }
    };
  }
};

const explorationService = {
  explore({ playerId, sourceContext, sourceChatId, commandText, correlationId }) {
    const db = getDb();
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
    if (!player) return { ok: false, error: 'Jogador não encontrado.' };

    const event = sampleWeighted(balance.explorationWeights);
    const session = db.prepare(`
      INSERT INTO exploration_sessions (player_id, region_id, status, result_type, result_payload_json)
      VALUES (?, ?, 'resolved', ?, '{}')
    `).run(playerId, player.region_id, event.type);

    let response = {
      title: 'EXPLORAÇÃO',
      summary: 'Nada de relevante aconteceu desta vez.',
      bullets: ['Recompensa: nenhuma', 'Risco: nenhum', 'Encontro com player: não']
    };

    if (event.type === 'resource_common' || event.type === 'herb') {
      const item = db.prepare(`SELECT id FROM items WHERE code = 'spirit_herb_common'`).get();
      const instance = db.prepare(`INSERT INTO item_instances (item_id, quality_tier, origin_type, metadata_json) VALUES (?, 'comum', 'exploration', '{}')`).run(item.id);
      db.prepare(`INSERT INTO player_inventory (player_id, item_instance_id, quantity, is_bound) VALUES (?, ?, 1, 0)`).run(playerId, instance.lastInsertRowid);
      response = {
        title: 'EXPLORAÇÃO',
        summary: 'Você encontrou uma erva espiritual durante a exploração.',
        bullets: ['Recompensa: Erva Espiritual Comum x1', 'Risco: nenhum', 'Encontro com player: não']
      };
    } else if (event.type === 'ore') {
      const item = db.prepare(`SELECT id FROM items WHERE code = 'rough_ore_common'`).get();
      const instance = db.prepare(`INSERT INTO item_instances (item_id, quality_tier, origin_type, metadata_json) VALUES (?, 'comum', 'exploration', '{}')`).run(item.id);
      db.prepare(`INSERT INTO player_inventory (player_id, item_instance_id, quantity, is_bound) VALUES (?, ?, 1, 0)`).run(playerId, instance.lastInsertRowid);
      response = {
        title: 'EXPLORAÇÃO',
        summary: 'Você encontrou minério espiritual bruto na região.',
        bullets: ['Recompensa: Minério Bruto Comum x1', 'Risco: baixo', 'Encontro com player: não']
      };
    } else if (event.type === 'monster_common' || event.type === 'monster_elite' || event.type === 'ambush') {
      const damage = event.type === 'monster_elite' ? 18 : event.type === 'ambush' ? 12 : 8;
      db.prepare(`UPDATE player_attributes SET hp_current = MAX(1, hp_current - ?), updated_at = CURRENT_TIMESTAMP WHERE player_id = ?`).run(damage, playerId);
      const goldGain = event.type === 'monster_elite' ? 18 : 8;
      const wallet = db.prepare('SELECT gold FROM wallet_balances WHERE player_id = ?').get(playerId);
      db.prepare('UPDATE wallet_balances SET gold = gold + ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?').run(goldGain, playerId);
      db.prepare(`
        INSERT INTO transactions (player_id, transaction_type, currency, amount, balance_before, balance_after, reference_type, reference_id)
        VALUES (?, 'exploration_reward', 'gold', ?, ?, ?, 'exploration_session', ?)
      `).run(playerId, goldGain, wallet.gold, wallet.gold + goldGain, session.lastInsertRowid);
      response = {
        title: 'EXPLORAÇÃO',
        summary: event.type === 'monster_elite' ? 'Você derrotou uma besta de elite.' : 'Você enfrentou um perigo durante a exploração.',
        bullets: [`Ouro obtido: +${goldGain}`, `Dano sofrido: ${damage}`, 'Encontro com player: não']
      };
    } else if (event.type === 'npc') {
      const wallet = db.prepare('SELECT spirit_stones FROM wallet_balances WHERE player_id = ?').get(playerId);
      db.prepare('UPDATE wallet_balances SET spirit_stones = spirit_stones + 1, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?').run(playerId);
      db.prepare(`
        INSERT INTO transactions (player_id, transaction_type, currency, amount, balance_before, balance_after, reference_type, reference_id)
        VALUES (?, 'npc_reward', 'spirit_stones', 1, ?, ?, 'exploration_session', ?)
      `).run(playerId, wallet.spirit_stones, wallet.spirit_stones + 1, session.lastInsertRowid);
      response = {
        title: 'EXPLORAÇÃO',
        summary: 'Um cultivador errante lhe entregou uma pedra espiritual inferior.',
        bullets: ['Pedras espirituais: +1', 'Risco: nenhum', 'Encontro com player: não']
      };
    }

    logService.write({
      serviceName: 'exploration',
      eventType: 'exploration',
      action: event.type,
      playerId,
      regionId: player.region_id,
      sourceContext,
      sourceChatId,
      commandText,
      correlationId,
      payload: {},
      result: response,
      status: 'success'
    });

    return { ok: true, data: response };
  }
};

const shopService = {
  listShopItems() {
    const db = getDb();
    return db.prepare(`
      SELECT si.id, si.price_amount, si.currency, si.daily_limit, i.code, i.name, i.rarity
      FROM shop_items si
      JOIN items i ON i.id = si.item_id
      WHERE si.is_active = 1
      ORDER BY si.price_amount ASC, i.name ASC
    `).all();
  },

  buy({ playerId, itemCode, quantity, sourceContext, sourceChatId, commandText, correlationId }) {
    const db = getDb();
    const listing = db.prepare(`
      SELECT si.*, i.id AS item_id, i.name AS item_name, i.code AS item_code
      FROM shop_items si
      JOIN items i ON i.id = si.item_id
      WHERE i.code = ? AND si.is_active = 1
      LIMIT 1
    `).get(itemCode);

    if (!listing) {
      return { ok: false, error: 'Item não encontrado na loja do bot.' };
    }

    const qty = Math.max(1, Number(quantity || 1));
    const wallet = db.prepare('SELECT * FROM wallet_balances WHERE player_id = ?').get(playerId);
    if (!wallet) return { ok: false, error: 'Carteira do jogador não encontrada.' };

    const currencyColumn = listing.currency;
    if (!(currencyColumn in wallet)) {
      return { ok: false, error: 'Moeda inválida para esta compra.' };
    }

    const totalPrice = listing.price_amount * qty;
    if (wallet[currencyColumn] < totalPrice) {
      return { ok: false, error: `Saldo insuficiente em ${currencyColumn}.` };
    }

    const tx = db.transaction(() => {
      db.prepare(`UPDATE wallet_balances SET ${currencyColumn} = ${currencyColumn} - ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?`).run(totalPrice, playerId);
      db.prepare(`
        INSERT INTO transactions (player_id, transaction_type, currency, amount, balance_before, balance_after, reference_type, reference_id)
        VALUES (?, 'shop_buy', ?, ?, ?, ?, 'shop_items', ?)
      `).run(playerId, currencyColumn, -totalPrice, wallet[currencyColumn], wallet[currencyColumn] - totalPrice, listing.id);

      const itemInstance = db.prepare(`INSERT INTO item_instances (item_id, quality_tier, origin_type, metadata_json) VALUES (?, 'comum', 'shop', '{}')`).run(listing.item_id);
      db.prepare(`INSERT INTO player_inventory (player_id, item_instance_id, quantity, is_bound) VALUES (?, ?, ?, 0)`).run(playerId, itemInstance.lastInsertRowid, qty);

      logService.write({
        serviceName: 'shop',
        eventType: 'shop_buy',
        action: 'buy',
        playerId,
        sourceContext,
        sourceChatId,
        commandText,
        correlationId,
        payload: { itemCode, quantity: qty },
        result: { totalPrice, currency: currencyColumn },
        status: 'success'
      });
    });

    tx();

    return {
      ok: true,
      data: {
        itemName: listing.item_name,
        quantity: qty,
        totalPrice,
        currency: currencyColumn
      }
    };
  }
};

module.exports = {
  logService,
  playerService,
  cultivationService,
  explorationService,
  shopService,
  helpers: { parseJson, sampleWeighted }
};

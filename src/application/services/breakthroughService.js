const { getDb } = require('../../infra/db/connection');

function tryBreakthrough({ playerId, pathType, sourceContext = 'system', sourceChatId = null, commandText = null, correlationId = null }) {
  const db = getDb();
  const path = db.prepare('SELECT * FROM player_cultivation WHERE player_id = ? AND path_type = ?').get(playerId, pathType);
  const attrs = db.prepare('SELECT * FROM player_attributes WHERE player_id = ?').get(playerId);

  if (!path || !attrs) {
    return { ok: false, error: 'Trilha de cultivo não encontrada.' };
  }

  if (path.sublevel < 9) {
    return { ok: false, error: 'Você ainda não atingiu o subnível 9/9 dessa trilha.' };
  }

  const baseChanceByRealm = {
    1: 85,
    2: 85,
    3: 85,
    4: 70,
    5: 70,
    6: 55,
    7: 55,
    8: 40,
    9: 40
  };

  const baseChance = baseChanceByRealm[path.realm_index] ?? 40;
  const comprehensionBonus = Math.min(12, Math.floor(attrs.comprehension / 12));
  const spiritBonus = Math.min(10, Math.floor(attrs.spirit / 15));
  const instabilityPenalty = Math.min(20, path.instability);
  const finalChance = Math.max(5, Math.min(95, baseChance + comprehensionBonus + spiritBonus - instabilityPenalty));
  const roll = Math.random() * 100;
  const success = roll <= finalChance;

  const tx = db.transaction(() => {
    if (success) {
      db.prepare(`
        UPDATE player_cultivation
        SET realm_index = realm_index + 1,
            sublevel = 1,
            xp_current = 0,
            instability = MAX(0, instability - 3),
            breakthrough_attempts = breakthrough_attempts + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(path.id);

      if (pathType === 'corpo') {
        db.prepare(`
          UPDATE player_attributes
          SET strength = strength + 3,
              constitution = constitution + 3,
              hp_max = hp_max + 25,
              hp_current = hp_current + 25,
              updated_at = CURRENT_TIMESTAMP
          WHERE player_id = ?
        `).run(playerId);
      } else if (pathType === 'espirito') {
        db.prepare(`
          UPDATE player_attributes
          SET intelligence = intelligence + 3,
              spirit = spirit + 3,
              qi_max = qi_max + 20,
              qi_current = qi_current + 20,
              updated_at = CURRENT_TIMESTAMP
          WHERE player_id = ?
        `).run(playerId);
      } else {
        db.prepare(`
          UPDATE player_attributes
          SET willpower = willpower + 3,
              perception = perception + 2,
              soul_max = soul_max + 18,
              soul_current = soul_current + 18,
              updated_at = CURRENT_TIMESTAMP
          WHERE player_id = ?
        `).run(playerId);
      }
    } else {
      const xpPenalty = Math.max(0, Math.floor(path.xp_current * 0.2));
      const hpLoss = Math.max(3, Math.min(15, 5 + path.realm_index));
      db.prepare(`
        UPDATE player_cultivation
        SET xp_current = MAX(0, xp_current - ?),
            instability = instability + 2,
            breakthrough_attempts = breakthrough_attempts + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(xpPenalty, path.id);

      db.prepare(`
        UPDATE player_attributes
        SET hp_current = MAX(1, hp_current - ?), updated_at = CURRENT_TIMESTAMP
        WHERE player_id = ?
      `).run(hpLoss, playerId);
    }

    db.prepare(`
      INSERT INTO game_logs (
        severity, service_name, event_type, action, player_id, source_context, source_chat_id,
        command_text, payload_json, result_json, status, correlation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'info',
      'breakthrough',
      'breakthrough',
      `break_${pathType}`,
      playerId,
      sourceContext,
      sourceChatId,
      commandText,
      JSON.stringify({ pathType, baseChance, finalChance, roll }),
      JSON.stringify({ success }),
      success ? 'success' : 'fail',
      correlationId
    );
  });

  tx();

  return {
    ok: true,
    data: {
      success,
      pathType,
      finalChance,
      roll: Number(roll.toFixed(2)),
      nextRealmIndex: success ? path.realm_index + 1 : path.realm_index,
      nextSublevel: success ? 1 : 9
    }
  };
}

module.exports = { tryBreakthrough };

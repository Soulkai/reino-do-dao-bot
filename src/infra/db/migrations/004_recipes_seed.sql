INSERT OR IGNORE INTO recipes (code, name, profession_id, rarity, difficulty, inputs_json, outputs_json)
SELECT
  'basic_recovery_pill_recipe',
  'Receita da Pílula Simples de Recuperação',
  p.id,
  'incomum',
  1,
  '{"spirit_herb_common":1,"simple_vial":1}',
  '{"basic_recovery_pill":1}'
FROM professions p
WHERE p.code = 'pill_master';

INSERT OR IGNORE INTO recipes (code, name, profession_id, rarity, difficulty, inputs_json, outputs_json)
SELECT
  'rough_ore_compaction_recipe',
  'Compactação de Minério Bruto',
  p.id,
  'comum',
  1,
  '{"rough_ore_common":2}',
  '{"rough_ore_common":1}'
FROM professions p
WHERE p.code = 'forge_master';

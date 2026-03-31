INSERT OR IGNORE INTO races (code, name, tier, description, effects_json) VALUES
('human', 'Humano', 'comum', 'Raça equilibrada e adaptável.', '{"comprehension_mult":1.05}'),
('half_spirit', 'Meio-Espírito', 'incomum', 'Sensível ao qi e à natureza.', '{"qi_mult":1.08,"spirit_bonus":5}'),
('beastborn', 'Bestial', 'incomum', 'Corpo forte e instinto feroz.', '{"strength_mult":1.08,"constitution_bonus":6}'),
('shadowborn', 'Sombrio', 'raro', 'Inclinação para trevas e ilusão.', '{"perception_mult":1.07,"willpower_bonus":5}'),
('draconic', 'Dracônico', 'raro', 'Herda traços de linhagem dracônica.', '{"strength_mult":1.10,"charisma_bonus":6}'),
('phoenix', 'Fênix', 'lendario', 'Sangue de fogo e renascimento.', '{"spirit_mult":1.08,"regen_mult":1.08}'),
('fallen_celestial', 'Celestial Caído', 'lendario', 'Luz e trevas em conflito.', '{"all_gain_mult":1.05}'),
('voidborn', 'Vazio Nascente', 'antigo', 'Afinidade rara com o vazio.', '{"dao_comprehension_mult":1.12}');

INSERT OR IGNORE INTO clans (code, name, tier, description, effects_json) VALUES
('jade_river', 'Clã do Rio Jade', 'comum', 'Coleta e disciplina.', '{"gather_mult":1.05}'),
('black_mountain', 'Clã da Montanha Negra', 'comum', 'Defesa e resistência.', '{"physical_def_mult":1.05}'),
('cold_moon', 'Clã da Lua Fria', 'incomum', 'Afinidade com gelo e água.', '{"ice_tech_mult":1.05}'),
('nine_suns', 'Clã dos Nove Sóis', 'raro', 'Especialistas em fogo e alquimia.', '{"alchemy_mult":1.06,"fire_tech_mult":1.06}'),
('violet_mist', 'Clã da Névoa Violeta', 'raro', 'Furtividade, ilusão e percepção.', '{"illusion_mult":1.06}'),
('scarlet_spear', 'Clã da Lança Escarlate', 'incomum', 'Perfuração e pressão ofensiva.', '{"spear_mult":1.05}'),
('thunder_pavilion', 'Pavilhão do Trovão', 'epico', 'Rapidez e trovão.', '{"thunder_mult":1.08}'),
('primordial_lineage', 'Linhagem Primordial', 'antigo', 'Linhagem antiga e estável.', '{"hybrid_growth_mult":1.10}');

INSERT OR IGNORE INTO spiritual_roots (code, name, tier, root_type, effects_json) VALUES
('metal_root', 'Raiz de Metal', 'comum', 'single', '{}'),
('wood_root', 'Raiz de Madeira', 'comum', 'single', '{}'),
('water_root', 'Raiz de Água', 'comum', 'single', '{}'),
('fire_root', 'Raiz de Fogo', 'comum', 'single', '{}'),
('earth_root', 'Raiz de Terra', 'comum', 'single', '{}'),
('wind_root', 'Raiz de Vento', 'raro', 'single', '{}'),
('thunder_root', 'Raiz de Trovão', 'raro', 'single', '{}'),
('ice_root', 'Raiz de Gelo', 'raro', 'single', '{}'),
('light_root', 'Raiz de Luz', 'epico', 'single', '{}'),
('dark_root', 'Raiz de Trevas', 'epico', 'single', '{}'),
('void_root', 'Raiz do Vazio', 'antigo', 'single', '{}');

INSERT OR IGNORE INTO divine_bodies (code, name, tier, description, effects_json) VALUES
('iron_black_body', 'Corpo de Ferro Negro', 'incomum', 'Corpo resistente.', '{}'),
('yang_burning_body', 'Corpo Yang Ardente', 'raro', 'Fogo, vigor e expansão.', '{}'),
('yin_extreme_body', 'Corpo Yin Extremo', 'raro', 'Gelo, alma e trevas.', '{}'),
('celestial_bones', 'Ossos Celestiais', 'sagrado', 'Suporta melhor tribulações.', '{}'),
('solar_sacred_body', 'Corpo Santo Solar', 'sagrado', 'Energia solar e recuperação.', '{}'),
('azure_dragon_body', 'Corpo Divino do Dragão Azure', 'divino', 'Autoridade dracônica.', '{}');

INSERT OR IGNORE INTO professions (code, name, category, description) VALUES
('pill_master', 'Mestre das Pílulas', 'craft', 'Refino de pílulas e elixires.'),
('forge_master', 'Mestre de Forja', 'craft', 'Criação de armas e armaduras.'),
('formation_master', 'Mestre de Formação', 'craft', 'Barreiras e selos.'),
('talisman_master', 'Mestre de Talismãs', 'craft', 'Pergaminhos e selos.'),
('herbalist', 'Herborista', 'gather', 'Coleta de ervas.'),
('spiritual_miner', 'Minerador Espiritual', 'gather', 'Extração de minérios.'),
('hunter', 'Caçador', 'gather', 'Coleta de materiais de bestas.'),
('explorer', 'Explorador', 'support', 'Mapas e descoberta.');

INSERT OR IGNORE INTO regions (code, name, danger_level, min_realm_index, max_realm_index, event_table_json) VALUES
('mortal_village', 'Vila Mortal', 1, 1, 2, '{"resource_common":25,"monster_common":8,"npc":12}'),
('mist_forest', 'Floresta Nebulosa', 2, 1, 3, '{"resource_common":18,"monster_common":16,"herb":10,"encounter":2}'),
('bone_valley', 'Vale dos Ossos', 3, 2, 4, '{"monster_common":20,"monster_elite":6,"ore":4}'),
('thunder_mountain', 'Montanha do Trovão', 4, 3, 5, '{"thunder":8,"monster_elite":8,"treasure":3}');

INSERT OR IGNORE INTO techniques (code, name, category, quality, element, required_realm_index, path_type, learn_requirements_json, effects_json) VALUES
('basic_body_art', 'Arte Básica de Tempero Corporal', 'cultivation', 'mortal', NULL, 1, 'corpo', '{}', '{"cultivation_mult":1.0}'),
('basic_qi_circulation', 'Circulação Básica de Qi', 'cultivation', 'mortal', NULL, 1, 'espirito', '{}', '{"cultivation_mult":1.0}'),
('basic_soul_meditation', 'Meditação Inicial da Alma', 'cultivation', 'mortal', NULL, 1, 'alma', '{}', '{"cultivation_mult":1.0}');

INSERT OR IGNORE INTO items (code, name, item_type, rarity, stackable, tradable, sellable_to_shop, base_value, metadata_json) VALUES
('spirit_herb_common', 'Erva Espiritual Comum', 'material', 'comum', 1, 1, 1, 10, '{}'),
('rough_ore_common', 'Minério Bruto Comum', 'material', 'comum', 1, 1, 1, 12, '{}'),
('simple_vial', 'Frasco Simples', 'tool', 'comum', 1, 1, 1, 8, '{}'),
('paper_talisman', 'Papel de Talismã', 'material', 'comum', 1, 1, 1, 7, '{}'),
('light_spirit_food', 'Comida Espiritual Leve', 'consumable', 'comum', 1, 1, 1, 14, '{"restore":{"qi":5}}'),
('basic_recovery_pill', 'Pílula Simples de Recuperação', 'pill', 'incomum', 1, 1, 1, 25, '{"restore":{"hp":15,"qi":10}}'),
('simple_spirit_compass', 'Bússola Espiritual Simples', 'utility', 'incomum', 1, 1, 1, 40, '{}'),
('small_inventory_expansion', 'Expansão Pequena de Inventário', 'utility', 'raro', 1, 1, 0, 120, '{}'),
('inferior_destiny_reversal_pill', 'Pílula Inferior de Reversão do Destino', 'pill', 'raro', 1, 1, 0, 300, '{}'),
('low_spirit_stone', 'Pedra Espiritual Inferior', 'currency_item', 'comum', 1, 1, 1, 20, '{}');

INSERT OR IGNORE INTO shop_items (item_id, price_amount, currency, daily_limit, stock_type, stock_amount, is_active)
SELECT id, 12, 'gold', NULL, 'infinite', NULL, 1 FROM items WHERE code = 'spirit_herb_common';
INSERT OR IGNORE INTO shop_items (item_id, price_amount, currency, daily_limit, stock_type, stock_amount, is_active)
SELECT id, 14, 'gold', NULL, 'infinite', NULL, 1 FROM items WHERE code = 'rough_ore_common';
INSERT OR IGNORE INTO shop_items (item_id, price_amount, currency, daily_limit, stock_type, stock_amount, is_active)
SELECT id, 9, 'gold', NULL, 'infinite', NULL, 1 FROM items WHERE code = 'simple_vial';
INSERT OR IGNORE INTO shop_items (item_id, price_amount, currency, daily_limit, stock_type, stock_amount, is_active)
SELECT id, 8, 'gold', NULL, 'infinite', NULL, 1 FROM items WHERE code = 'paper_talisman';
INSERT OR IGNORE INTO shop_items (item_id, price_amount, currency, daily_limit, stock_type, stock_amount, is_active)
SELECT id, 16, 'gold', NULL, 'infinite', NULL, 1 FROM items WHERE code = 'light_spirit_food';
INSERT OR IGNORE INTO shop_items (item_id, price_amount, currency, daily_limit, stock_type, stock_amount, is_active)
SELECT id, 28, 'gold', 10, 'infinite', NULL, 1 FROM items WHERE code = 'basic_recovery_pill';
INSERT OR IGNORE INTO shop_items (item_id, price_amount, currency, daily_limit, stock_type, stock_amount, is_active)
SELECT id, 50, 'gold', 3, 'infinite', NULL, 1 FROM items WHERE code = 'simple_spirit_compass';
INSERT OR IGNORE INTO shop_items (item_id, price_amount, currency, daily_limit, stock_type, stock_amount, is_active)
SELECT id, 150, 'gold', 1, 'infinite', NULL, 1 FROM items WHERE code = 'small_inventory_expansion';
INSERT OR IGNORE INTO shop_items (item_id, price_amount, currency, daily_limit, stock_type, stock_amount, is_active)
SELECT id, 2, 'destiny_points', 1, 'infinite', NULL, 1 FROM items WHERE code = 'inferior_destiny_reversal_pill';

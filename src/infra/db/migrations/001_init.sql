CREATE TABLE IF NOT EXISTS races (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  description TEXT,
  effects_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  description TEXT,
  effects_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spiritual_roots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  root_type TEXT NOT NULL,
  effects_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS divine_bodies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  description TEXT,
  effects_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS professions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  danger_level INTEGER NOT NULL DEFAULT 1,
  min_realm_index INTEGER NOT NULL DEFAULT 1,
  max_realm_index INTEGER NOT NULL DEFAULT 3,
  event_table_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS techniques (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quality TEXT NOT NULL,
  element TEXT,
  required_realm_index INTEGER NOT NULL DEFAULT 1,
  path_type TEXT,
  learn_requirements_json TEXT NOT NULL DEFAULT '{}',
  effects_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  item_type TEXT NOT NULL,
  rarity TEXT NOT NULL,
  stackable INTEGER NOT NULL DEFAULT 1,
  tradable INTEGER NOT NULL DEFAULT 1,
  sellable_to_shop INTEGER NOT NULL DEFAULT 1,
  base_value INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT NOT NULL UNIQUE,
  display_name TEXT,
  character_name TEXT NOT NULL UNIQUE,
  sex TEXT NOT NULL,
  age INTEGER NOT NULL DEFAULT 16,
  race_id INTEGER NOT NULL,
  clan_id INTEGER NOT NULL,
  talent_tier TEXT NOT NULL,
  spiritual_root_id INTEGER,
  divine_body_id INTEGER,
  luck_tier TEXT NOT NULL,
  sect_id INTEGER,
  region_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  prestige INTEGER NOT NULL DEFAULT 0,
  karma INTEGER NOT NULL DEFAULT 0,
  reputation INTEGER NOT NULL DEFAULT 0,
  last_command_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (race_id) REFERENCES races(id),
  FOREIGN KEY (clan_id) REFERENCES clans(id),
  FOREIGN KEY (spiritual_root_id) REFERENCES spiritual_roots(id),
  FOREIGN KEY (divine_body_id) REFERENCES divine_bodies(id),
  FOREIGN KEY (region_id) REFERENCES regions(id)
);

CREATE TABLE IF NOT EXISTS player_attributes (
  player_id INTEGER PRIMARY KEY,
  strength INTEGER NOT NULL,
  agility INTEGER NOT NULL,
  constitution INTEGER NOT NULL,
  intelligence INTEGER NOT NULL,
  perception INTEGER NOT NULL,
  spirit INTEGER NOT NULL,
  comprehension INTEGER NOT NULL,
  luck INTEGER NOT NULL,
  charisma INTEGER NOT NULL,
  willpower INTEGER NOT NULL,
  hp_current INTEGER NOT NULL,
  hp_max INTEGER NOT NULL,
  qi_current INTEGER NOT NULL,
  qi_max INTEGER NOT NULL,
  body_energy_current INTEGER NOT NULL,
  body_energy_max INTEGER NOT NULL,
  soul_current INTEGER NOT NULL,
  soul_max INTEGER NOT NULL,
  fatigue INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS player_cultivation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  path_type TEXT NOT NULL,
  realm_index INTEGER NOT NULL DEFAULT 1,
  sublevel INTEGER NOT NULL DEFAULT 1,
  xp_current INTEGER NOT NULL DEFAULT 0,
  instability INTEGER NOT NULL DEFAULT 0,
  technique_id INTEGER,
  breakthrough_attempts INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (technique_id) REFERENCES techniques(id),
  UNIQUE(player_id, path_type)
);

CREATE TABLE IF NOT EXISTS wallet_balances (
  player_id INTEGER PRIMARY KEY,
  gold INTEGER NOT NULL DEFAULT 0,
  spirit_stones INTEGER NOT NULL DEFAULT 0,
  celestial_crystals INTEGER NOT NULL DEFAULT 0,
  merit INTEGER NOT NULL DEFAULT 0,
  destiny_points INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS item_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  quality_tier TEXT NOT NULL DEFAULT 'comum',
  enhancement_level INTEGER NOT NULL DEFAULT 0,
  durability INTEGER,
  crafter_player_id INTEGER,
  origin_type TEXT NOT NULL DEFAULT 'system',
  bound_to_player_id INTEGER,
  custom_name TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (crafter_player_id) REFERENCES players(id),
  FOREIGN KEY (bound_to_player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS player_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  item_instance_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_bound INTEGER NOT NULL DEFAULT 0,
  slot_type TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (item_instance_id) REFERENCES item_instances(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shop_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  price_amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  daily_limit INTEGER,
  stock_type TEXT NOT NULL DEFAULT 'infinite',
  stock_amount INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS exploration_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  region_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  result_type TEXT,
  result_payload_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (region_id) REFERENCES regions(id)
);

CREATE TABLE IF NOT EXISTS game_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  severity TEXT NOT NULL DEFAULT 'info',
  service_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  action TEXT NOT NULL,
  player_id INTEGER,
  target_player_id INTEGER,
  sect_id INTEGER,
  region_id INTEGER,
  source_context TEXT NOT NULL,
  source_chat_id TEXT,
  command_text TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  result_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  error_message TEXT,
  execution_ms INTEGER,
  correlation_id TEXT,
  command_hash TEXT,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (region_id) REFERENCES regions(id)
);

CREATE INDEX IF NOT EXISTS idx_players_phone_number ON players(phone_number);
CREATE INDEX IF NOT EXISTS idx_players_character_name ON players(character_name);
CREATE INDEX IF NOT EXISTS idx_players_region_id ON players(region_id);
CREATE INDEX IF NOT EXISTS idx_game_logs_event_type ON game_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_game_logs_player_id ON game_logs(player_id);
CREATE INDEX IF NOT EXISTS idx_game_logs_created_at ON game_logs(created_at);

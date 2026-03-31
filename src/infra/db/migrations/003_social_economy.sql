CREATE TABLE IF NOT EXISTS player_techniques (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  technique_id INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp_current INTEGER NOT NULL DEFAULT 0,
  is_equipped INTEGER NOT NULL DEFAULT 0,
  learned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (technique_id) REFERENCES techniques(id),
  UNIQUE(player_id, technique_id)
);

CREATE TABLE IF NOT EXISTS player_professions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  profession_id INTEGER NOT NULL,
  slot_type TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp_current INTEGER NOT NULL DEFAULT 0,
  rank_tier TEXT NOT NULL DEFAULT 'Aprendiz',
  proficiency INTEGER NOT NULL DEFAULT 0,
  learned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (profession_id) REFERENCES professions(id),
  UNIQUE(player_id, profession_id)
);

CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  profession_id INTEGER NOT NULL,
  rarity TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  inputs_json TEXT NOT NULL,
  outputs_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profession_id) REFERENCES professions(id)
);

CREATE TABLE IF NOT EXISTS player_recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  learned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id),
  UNIQUE(player_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS market_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_player_id INTEGER NOT NULL,
  item_instance_id INTEGER,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price_amount INTEGER NOT NULL,
  price_currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_player_id) REFERENCES players(id),
  FOREIGN KEY (item_instance_id) REFERENCES item_instances(id),
  FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE IF NOT EXISTS auction_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_player_id INTEGER NOT NULL,
  item_instance_id INTEGER,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  min_bid_amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  highest_bid_amount INTEGER,
  highest_bidder_player_id INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled',
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_player_id) REFERENCES players(id),
  FOREIGN KEY (item_instance_id) REFERENCES item_instances(id),
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (highest_bidder_player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS encounters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER NOT NULL,
  player_a_id INTEGER NOT NULL,
  player_b_id INTEGER NOT NULL,
  encounter_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (region_id) REFERENCES regions(id),
  FOREIGN KEY (player_a_id) REFERENCES players(id),
  FOREIGN KEY (player_b_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS encounter_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  encounter_id INTEGER NOT NULL,
  sender_player_id INTEGER NOT NULL,
  message_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS sects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  founder_player_id INTEGER NOT NULL,
  leader_player_id INTEGER NOT NULL,
  description TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  contribution_pool INTEGER NOT NULL DEFAULT 0,
  treasury_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (founder_player_id) REFERENCES players(id),
  FOREIGN KEY (leader_player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS sect_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sect_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  contribution INTEGER NOT NULL DEFAULT 0,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sect_id) REFERENCES sects(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE(sect_id, player_id)
);

CREATE TABLE IF NOT EXISTS sect_missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sect_id INTEGER NOT NULL,
  creator_player_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  generated_payload_json TEXT NOT NULL DEFAULT '{}',
  reward_payload_json TEXT NOT NULL DEFAULT '{}',
  min_realm_index INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  FOREIGN KEY (sect_id) REFERENCES sects(id) ON DELETE CASCADE,
  FOREIGN KEY (creator_player_id) REFERENCES players(id)
);

CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_market_listings_seller ON market_listings(seller_player_id);
CREATE INDEX IF NOT EXISTS idx_auction_listings_status ON auction_listings(status);
CREATE INDEX IF NOT EXISTS idx_encounters_status ON encounters(status);

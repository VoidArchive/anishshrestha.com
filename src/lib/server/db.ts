export async function ensureSchema(db: any) {
  // idempotent table creation using IF NOT EXISTS
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS game_rooms (
      id TEXT PRIMARY KEY,
      host_player_id TEXT NOT NULL,
      guest_player_id TEXT,
      game_mode TEXT DEFAULT 'REFORGED',
      status TEXT DEFAULT 'WAITING' CHECK (status IN ('WAITING','ACTIVE','COMPLETED','ABANDONED')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      room_code TEXT UNIQUE,
      allow_spectators BOOLEAN DEFAULT FALSE
    );`),
    db.prepare(`CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar_url TEXT,
      created_at INTEGER NOT NULL,
      last_seen INTEGER NOT NULL,
      games_played INTEGER DEFAULT 0,
      games_won INTEGER DEFAULT 0
    );`),
    db.prepare(`CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      game_state TEXT NOT NULL,
      move_count INTEGER DEFAULT 0,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      winner TEXT,
      ended_reason TEXT,
      duration_seconds INTEGER,
      FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE
    );`),
    db.prepare(`CREATE TABLE IF NOT EXISTS moves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      move_data TEXT NOT NULL,
      move_number INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      board_state_after TEXT,
      FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players(id)
    );`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_rooms_status ON game_rooms(status);`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_rooms_code ON game_rooms(room_code);`)
  ]);
} 
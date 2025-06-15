-- Bagchal Reforged Multiplayer Database Schema

-- Game Rooms (Multiplayer Sessions)
CREATE TABLE IF NOT EXISTS game_rooms (
  id TEXT PRIMARY KEY,
  host_player_id TEXT NOT NULL,
  guest_player_id TEXT,
  game_mode TEXT DEFAULT 'REFORGED',
  status TEXT DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'ACTIVE', 'COMPLETED', 'ABANDONED')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  room_code TEXT UNIQUE, -- Human-readable room code like "TIGER-GOAT-123"
  allow_spectators BOOLEAN DEFAULT FALSE
);

-- Players
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0
);

-- Game Sessions (Actual game instances)
CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  game_state TEXT NOT NULL, -- JSON serialized GameState
  move_count INTEGER DEFAULT 0,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  winner TEXT CHECK (winner IN ('GOAT', 'TIGER', 'DRAW') OR winner IS NULL),
  ended_reason TEXT CHECK (ended_reason IN ('WIN', 'DRAW', 'TIMEOUT', 'DISCONNECT', 'ABANDON') OR ended_reason IS NULL),
  duration_seconds INTEGER,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE
);

-- Move History
CREATE TABLE IF NOT EXISTS moves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  move_data TEXT NOT NULL, -- JSON serialized move
  move_number INTEGER NOT NULL,
  timestamp INTEGER NOT NULL,
  board_state_after TEXT, -- Snapshot for replay
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_host ON game_rooms(host_player_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON game_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_sessions_room ON game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_moves_session ON moves(session_id);
CREATE INDEX IF NOT EXISTS idx_moves_player ON moves(player_id);

-- Cleanup trigger for expired rooms
CREATE TRIGGER IF NOT EXISTS cleanup_expired_rooms
AFTER INSERT ON game_rooms
BEGIN
  DELETE FROM game_rooms 
  WHERE expires_at < strftime('%s', 'now') * 1000 
  AND status IN ('WAITING', 'ABANDONED');
END; 
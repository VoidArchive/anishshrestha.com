-- GameRoomDurableObject persistent state with optimistic versioning
CREATE TABLE IF NOT EXISTS room_state (
  id TEXT PRIMARY KEY,
  blob TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
); 
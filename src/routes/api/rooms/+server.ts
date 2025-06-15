// Room Management API for Bagchal Reforged Multiplayer

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { 
  CreateRoomRequest, 
  CreateRoomResponse, 
  JoinRoomRequest, 
  JoinRoomResponse 
} from '../../../games/bagchal/types/multiplayer';
import { generateId, generateRoomCode } from '../../../lib/utils/multiplayer';
import { ensureSchema } from '$core/server';
import { generateToken } from '../../../lib/utils/auth';
import { sanitizeText } from '../../../lib/utils/security';
import { generateCorrelationId, log } from '../../../lib/utils/logger';
// import { sanitizePlayerName, sanitizeGameState } from '../../../lib/utils/security';

// Create a new game room
export const POST: RequestHandler = async ({ request, platform }) => {
  const correlationId = generateCorrelationId();
  try {
    const body: CreateRoomRequest = await request.json();
    let { playerName, gameMode, allowSpectators = false } = body;

    playerName = sanitizeText(playerName);

    if (!playerName || !gameMode) {
      log('error', 'Missing required fields', correlationId);
      return json({ error: 'Missing required fields', code: 'ERR_VALIDATION', correlationId }, { status: 400, headers: { 'x-correlation-id': correlationId } });
    }

    if (gameMode !== 'REFORGED') {
      return error(400, 'Only REFORGED mode is supported for multiplayer');
    }

    const db = platform?.env?.DB;
    if (!db) {
      log('error', 'Database not available', correlationId);
      return json({ error: 'Database not available', code: 'ERR_DB', correlationId }, { status: 500, headers: { 'x-correlation-id': correlationId } });
    }

    // Ensure tables exist (no-op after first run)
    await ensureSchema(db);

    // Generate IDs
    const roomId = generateId();
    const playerId = generateId();
    const roomCode = generateRoomCode();
    const now = Date.now();
    const expiresAt = now + (2 * 60 * 60 * 1000); // 2 hours

    // Create player record
    await db.prepare(`
      INSERT OR REPLACE INTO players (id, name, created_at, last_seen, games_played, games_won)
      VALUES (?, ?, ?, ?, 0, 0)
    `).bind(playerId, playerName, now, now).run();

    // Create room record
    await db.prepare(`
      INSERT INTO game_rooms (
        id, host_player_id, game_mode, status, created_at, updated_at, expires_at, room_code, allow_spectators
      ) VALUES (?, ?, ?, 'WAITING', ?, ?, ?, ?, ?)
    `).bind(roomId, playerId, gameMode, now, now, expiresAt, roomCode, allowSpectators).run();

    // Create initial game session
    const sessionId = generateId();
    const initialGameState = {
      board: Array(25).fill(null),
      turn: 'GOAT',
      phase: 'PLACEMENT',
      goatsPlaced: 0,
      goatsCaptured: 0,
      winner: null,
      selectedPieceId: null,
      validMoves: [],
      message: 'Waiting for second player...',
      positionHistory: [],
      positionCounts: {},
      mode: 'REFORGED',
      movesWithoutCapture: 0,
      // Multiplayer specific
      roomId,
      roomCode,
      hostPlayerId: playerId,
      guestPlayerId: null,
      currentPlayerId: playerId,
      isHost: true,
      connectionStatus: 'connected',
      lastSyncTimestamp: now,
      players: {
        [playerId]: {
          id: playerId,
          name: playerName,
          role: 'GOAT',
          connected: true,
          lastSeen: now
        }
      }
    };

    await db.prepare(`
      INSERT INTO game_sessions (id, room_id, game_state, started_at)
      VALUES (?, ?, ?, ?)
    `).bind(sessionId, roomId, JSON.stringify(initialGameState), now).run();

    const secret = (platform?.env as any)?.JWT_SECRET as string | undefined;
    if (!secret) {
      log('error', 'JWT_SECRET missing', correlationId);
      return json({ error: 'Server misconfiguration', code: 'ERR_CONFIG', correlationId }, { status: 500, headers: { 'x-correlation-id': correlationId } });
    }

    const authToken = await generateToken(roomCode, playerId, secret);

    const response: CreateRoomResponse = {
      roomId,
      roomCode,
      playerId,
      role: 'GOAT',
      authToken
    };

    log('info', 'Room created', correlationId, { roomId });
    return json(response, { headers: { 'x-correlation-id': correlationId } });

  } catch (err) {
    log('error', 'Failed to create room', correlationId, { err: String(err) });
    return json({ error: 'Failed to create room', code: 'ERR_UNEXPECTED', correlationId }, { status: 500, headers: { 'x-correlation-id': correlationId } });
  }
};

// Get room information
export const GET: RequestHandler = async ({ url, platform }) => {
  try {
    const roomCode = url.searchParams.get('roomCode');
    
    if (!roomCode) {
      return error(400, 'Missing roomCode parameter');
    }

    const db = platform?.env?.DB;
    if (!db) {
      return error(500, 'Database not available');
    }

    const room = await db.prepare(`
      SELECT r.*, s.game_state
      FROM game_rooms r
      LEFT JOIN game_sessions s ON r.id = s.room_id
      WHERE r.room_code = ? AND r.status IN ('WAITING', 'ACTIVE')
    `).bind(roomCode).first();

    if (!room) {
      return error(404, 'Room not found or expired');
    }

    // Check if room has expired
    if (room.expires_at < Date.now()) {
      // Clean up expired room
      await db.prepare('UPDATE game_rooms SET status = "ABANDONED" WHERE id = ?')
        .bind(room.id).run();
      return error(404, 'Room has expired');
    }

    const gameState = room.game_state ? JSON.parse(room.game_state) : null;

    return json({
      roomId: room.id,
      roomCode: room.room_code,
      status: room.status,
      hostPlayerId: room.host_player_id,
      guestPlayerId: room.guest_player_id,
      gameMode: room.game_mode,
      allowSpectators: room.allow_spectators,
      gameState
    });

  } catch (err) {
    console.error('Error getting room:', err);
    return error(500, 'Failed to get room information');
  }
}; 
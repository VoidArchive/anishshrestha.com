// Join Room API for Bagchal Reforged Multiplayer

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { JoinRoomRequest, JoinRoomResponse } from '../../../../../games/bagchal/types/multiplayer';
import { generateId, isValidRoomCode } from '../../../../../lib/utils/multiplayer';
import { sanitizeText } from '../../../../../lib/utils/security';
import { ensureSchema } from '$core/server';
import { generateToken } from '../../../../../lib/utils/auth';
import { generateCorrelationId, log } from '../../../../../lib/utils/logger';

export const POST: RequestHandler = async ({ params, request, platform }) => {
  const correlationId = generateCorrelationId();
  try {
    const { roomCode } = params;
    const body: JoinRoomRequest = await request.json();
    let { playerName } = body;

    playerName = sanitizeText(playerName);

    if (!roomCode || !playerName) {
      log('error', 'Missing roomCode or playerName', correlationId);
      return json({ error: 'Missing roomCode or playerName', code: 'ERR_VALIDATION', correlationId }, { status: 400, headers: { 'x-correlation-id': correlationId } });
    }

    if (!isValidRoomCode(roomCode)) {
      log('error', 'Invalid room code format', correlationId);
      return json({ error: 'Invalid room code format', code: 'ERR_VALIDATION', correlationId }, { status: 400, headers: { 'x-correlation-id': correlationId } });
    }

    const db = platform?.env?.DB;
    if (!db) {
      log('error', 'Database not available', correlationId);
      return json({ error: 'Database not available', code: 'ERR_DB', correlationId }, { status: 500, headers: { 'x-correlation-id': correlationId } });
    }

    // Ensure tables exist
    await ensureSchema(db);

    // Find the room
    const room = await db.prepare(`
      SELECT * FROM game_rooms 
      WHERE room_code = ? AND status = 'WAITING'
    `).bind(roomCode).first();

    if (!room) {
      log('error', 'Room not found', correlationId);
      return json({ error: 'Room not found or no longer accepting players', code: 'ERR_NOT_FOUND', correlationId }, { status: 404, headers: { 'x-correlation-id': correlationId } });
    }

    // Check if room has expired
    if (room.expires_at < Date.now()) {
      log('info', 'Room expired', correlationId);
      await db.prepare('UPDATE game_rooms SET status = "ABANDONED" WHERE id = ?')
        .bind(room.id).run();
      return json({ error: 'Room has expired', code: 'ERR_EXPIRED', correlationId }, { status: 404, headers: { 'x-correlation-id': correlationId } });
    }

    // Check if room already has a guest
    if (room.guest_player_id) {
      log('error', 'Room full', correlationId);
      return json({ error: 'Room is already full', code: 'ERR_ROOM_FULL', correlationId }, { status: 409, headers: { 'x-correlation-id': correlationId } });
    }

    const playerId = generateId();
    const now = Date.now();

    // Create player record
    await db.prepare(`
      INSERT OR REPLACE INTO players (id, name, created_at, last_seen, games_played, games_won)
      VALUES (?, ?, ?, ?, 0, 0)
    `).bind(playerId, playerName, now, now).run();

    // Update room with guest player and set status to ACTIVE
    await db.prepare(`
      UPDATE game_rooms 
      SET guest_player_id = ?, status = 'ACTIVE', updated_at = ?
      WHERE id = ?
    `).bind(playerId, now, room.id).run();

    // Get current game session and update with guest player
    const session = await db.prepare(`
      SELECT * FROM game_sessions WHERE room_id = ?
    `).bind(room.id).first();

    if (session) {
      const gameState = JSON.parse(session.game_state);
      
      // Add guest player
      gameState.guestPlayerId = playerId;
      gameState.players[playerId] = {
        id: playerId,
        name: playerName,
        role: 'TIGER',
        connected: true,
        lastSeen: now
      };
      
      // Update game message
      gameState.message = 'Both players connected! Goats place first.';
      gameState.lastSyncTimestamp = now;

      // Update session with new game state
      await db.prepare(`
        UPDATE game_sessions 
        SET game_state = ?, updated_at = ?
        WHERE id = ?
      `).bind(JSON.stringify(gameState), now, session.id).run();

      // Generate auth token
      const secret = (platform?.env as any)?.JWT_SECRET as string | undefined;
      if (!secret) {
        log('error', 'JWT_SECRET missing', correlationId);
        return json({ error: 'Server misconfiguration', code: 'ERR_CONFIG', correlationId }, { status: 500, headers: { 'x-correlation-id': correlationId } });
      }

      const authToken = await generateToken(roomCode, playerId, secret);

      const response: JoinRoomResponse = {
        roomId: room.id,
        roomCode: roomCode,
        playerId,
        role: 'TIGER',
        authToken,
        gameState
      };

      log('info', 'Player joined room', correlationId, { roomId: room.id, playerId });
      return json(response, { headers: { 'x-correlation-id': correlationId } });
    } else {
      log('error', 'Game session not found', correlationId);
      return json({ error: 'Game session not found', code: 'ERR_NOT_FOUND', correlationId }, { status: 500, headers: { 'x-correlation-id': correlationId } });
    }

  } catch (err) {
    log('error', 'Failed to join room', correlationId, { err: String(err) });
    return json({ error: 'Failed to join room', code: 'ERR_UNEXPECTED', correlationId }, { status: 500, headers: { 'x-correlation-id': correlationId } });
  }
}; 
// Join Room API for Bagchal Reforged Multiplayer

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { JoinRoomRequest, JoinRoomResponse } from '../../../../../games/bagchal/types/multiplayer';
import { generateId, isValidRoomCode } from '../../../../../lib/utils/multiplayer';

export const POST: RequestHandler = async ({ params, request, platform }) => {
  try {
    const { roomCode } = params;
    const body: JoinRoomRequest = await request.json();
    const { playerName } = body;

    if (!roomCode || !playerName) {
      return error(400, 'Missing roomCode or playerName');
    }

    if (!isValidRoomCode(roomCode)) {
      return error(400, 'Invalid room code format');
    }

    const db = platform?.env?.DB;
    if (!db) {
      return error(500, 'Database not available');
    }

    // Find the room
    const room = await db.prepare(`
      SELECT * FROM game_rooms 
      WHERE room_code = ? AND status = 'WAITING'
    `).bind(roomCode).first();

    if (!room) {
      return error(404, 'Room not found or no longer accepting players');
    }

    // Check if room has expired
    if (room.expires_at < Date.now()) {
      await db.prepare('UPDATE game_rooms SET status = "ABANDONED" WHERE id = ?')
        .bind(room.id).run();
      return error(404, 'Room has expired');
    }

    // Check if room already has a guest
    if (room.guest_player_id) {
      return error(409, 'Room is already full');
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

      const response: JoinRoomResponse = {
        roomId: room.id,
        playerId,
        role: 'TIGER',
        gameState
      };

      return json(response);
    } else {
      return error(500, 'Game session not found');
    }

  } catch (err) {
    console.error('Error joining room:', err);
    return error(500, 'Failed to join room');
  }
}; 
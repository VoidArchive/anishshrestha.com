import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, platform }) => {
  const { roomCode } = params;
  const { playerId } = await request.json();

  if (!playerId) {
    return json({ error: 'Player ID is required' }, { status: 400 });
  }

  if (!platform?.env?.GAME_ROOMS) {
    return json({ error: 'Multiplayer not available' }, { status: 503 });
  }

  try {
    // Get Durable Object instance for this room
    const roomId = platform.env.GAME_ROOMS.idFromName(roomCode);
    const roomObject = platform.env.GAME_ROOMS.get(roomId);

    // Create WebSocket URL for this specific room
    const websocketUrl = `${new URL(request.url).origin}/api/rooms/${roomCode}/ws?playerId=${encodeURIComponent(playerId)}&roomCode=${encodeURIComponent(roomCode)}`;

    return json({
      websocketUrl,
      roomCode,
      playerId
    });
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    return json({ error: 'Failed to create connection' }, { status: 500 });
  }
}; 
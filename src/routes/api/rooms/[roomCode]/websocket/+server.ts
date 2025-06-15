import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '../../../../../lib/utils/auth';

export const POST: RequestHandler = async ({ params, request, platform }) => {
  const { roomCode } = params;
  const { playerId, authToken } = await request.json();

  if (!authToken) {
    return json({ error: 'Missing auth token' }, { status: 400 });
  }

  const secret = (platform?.env as any)?.JWT_SECRET as string | undefined;
  if (!secret) {
    return json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const verified = await verifyToken(authToken, secret);
  if (!verified || verified.playerId !== playerId || verified.roomCode !== roomCode) {
    return json({ error: 'Invalid auth token' }, { status: 401 });
  }

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
    const websocketUrl = `${new URL(request.url).origin}/api/rooms/${roomCode}/ws?playerId=${encodeURIComponent(playerId)}&roomCode=${encodeURIComponent(roomCode)}&token=${encodeURIComponent(authToken)}`;

    return json({
      websocketUrl,
      roomCode,
      playerId,
      authToken
    });
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    return json({ error: 'Failed to create connection' }, { status: 500 });
  }
}; 
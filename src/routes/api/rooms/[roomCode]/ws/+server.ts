import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, request, platform }) => {
  const { roomCode } = params;
  const playerId = url.searchParams.get('playerId');
  const token = url.searchParams.get('token');

  if (!playerId) {
    return new Response('Missing playerId parameter', { status: 400 });
  }

  if (!platform?.env?.GAME_ROOMS) {
    return new Response('Multiplayer not available', { status: 503 });
  }

  try {
    // Get Durable Object instance for this room
    const roomId = platform.env.GAME_ROOMS.idFromName(roomCode);
    const roomObject = platform.env.GAME_ROOMS.get(roomId);

    // Forward the WebSocket upgrade request to the Durable Object
    const durableObjectUrl = new URL(request.url);
    durableObjectUrl.pathname = '/websocket';
    durableObjectUrl.searchParams.set('playerId', playerId!);
    durableObjectUrl.searchParams.set('roomCode', roomCode);
    if (token) durableObjectUrl.searchParams.set('token', token);

    // Create a new request with proper WebSocket upgrade headers
    const upgradeHeaders = new Headers(request.headers);
    
    return await roomObject.fetch(durableObjectUrl.toString(), {
      method: 'GET',
      headers: upgradeHeaders
    });
  } catch (error) {
    console.error('WebSocket upgrade failed:', error);
    return new Response('WebSocket upgrade failed', { status: 500 });
  }
}; 
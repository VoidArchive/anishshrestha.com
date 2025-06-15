// Multiplayer module exports
export { WebSocketClient } from './WebSocketClient';
export type { ConnectionStatus, WebSocketClientOptions } from './WebSocketClient';

// Re-export types for convenience
export type { 
  MultiplayerGameState, 
  WebSocketMessage, 
  PlayerInfo,
  GameMoveMessage 
} from '../../games/bagchal/types/multiplayer'; 
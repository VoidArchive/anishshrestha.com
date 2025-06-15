// Multiplayer-specific types for Bagchal Reforged

import type { GameState, Player } from '../rules';

export interface MultiplayerGameState extends GameState {
  // Room information
  roomId: string;
  roomCode: string;
  
  // Player information
  hostPlayerId: string;
  guestPlayerId: string | null;
  currentPlayerId: string; // Which player should make the next move
  
  // Connection state
  players: {
    [playerId: string]: PlayerInfo;
  };
  
  // Network state
  isHost: boolean;
  connectionStatus: ConnectionStatus;
  lastSyncTimestamp: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  role: 'GOAT' | 'TIGER';
  connected: boolean;
  lastSeen: number;
  avatarUrl?: string;
}

export type ConnectionStatus = 
  | 'disconnected'
  | 'connecting' 
  | 'connected' 
  | 'reconnecting'
  | 'error';

export type RoomStatus = 
  | 'WAITING'    // Waiting for second player
  | 'ACTIVE'     // Game in progress
  | 'COMPLETED'  // Game finished
  | 'ABANDONED'; // Room abandoned

// WebSocket message types
export interface BaseMessage {
  type: string;
  timestamp: number;
  playerId: string;
}

export interface GameMoveMessage extends BaseMessage {
  type: 'GAME_MOVE';
  move: {
    from: number | null;
    to: number;
    jumpedGoatId?: number | null;
    moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE';
  };
}

export interface GameStateMessage extends BaseMessage {
  type: 'GAME_STATE';
  gameState: MultiplayerGameState;
}

export interface PlayerJoinMessage extends BaseMessage {
  type: 'PLAYER_JOIN';
  playerInfo: PlayerInfo;
}

export interface PlayerLeaveMessage extends BaseMessage {
  type: 'PLAYER_LEAVE';
  playerId: string;
  reason: 'disconnect' | 'abandon';
}

export interface GameEndMessage extends BaseMessage {
  type: 'GAME_END';
  winner: Player | 'DRAW' | null;
  reason: 'win' | 'draw' | 'timeout' | 'disconnect' | 'abandon';
}

export interface ErrorMessage extends BaseMessage {
  type: 'ERROR';
  error: string;
  code?: string;
}

export interface PingMessage extends BaseMessage {
  type: 'PING';
}

export interface PongMessage extends BaseMessage {
  type: 'PONG';
}

export type WebSocketMessage = 
  | GameMoveMessage
  | GameStateMessage
  | PlayerJoinMessage
  | PlayerLeaveMessage
  | GameEndMessage
  | ErrorMessage
  | PingMessage
  | PongMessage;

// Room creation/joining types
export interface CreateRoomRequest {
  playerName: string;
  gameMode: 'REFORGED';
  allowSpectators?: boolean;
}

export interface CreateRoomResponse {
  roomId: string;
  roomCode: string;
  playerId: string;
  role: 'GOAT' | 'TIGER';
  authToken: string;
}

export interface JoinRoomRequest {
  roomCode: string;
  playerName: string;
}

export interface JoinRoomResponse {
  roomId: string;
  playerId: string;
  role: 'GOAT' | 'TIGER';
  authToken: string;
  gameState: MultiplayerGameState;
}

// Database entity types
export interface GameRoomEntity {
  id: string;
  host_player_id: string;
  guest_player_id: string | null;
  game_mode: 'REFORGED';
  status: RoomStatus;
  created_at: number;
  updated_at: number;
  expires_at: number;
  room_code: string;
  allow_spectators: boolean;
}

export interface PlayerEntity {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: number;
  last_seen: number;
  games_played: number;
  games_won: number;
}

export interface GameSessionEntity {
  id: string;
  room_id: string;
  game_state: string; // JSON serialized
  move_count: number;
  started_at: number;
  ended_at: number | null;
  winner: Player | 'DRAW' | null;
  ended_reason: 'WIN' | 'DRAW' | 'TIMEOUT' | 'DISCONNECT' | 'ABANDON' | null;
  duration_seconds: number | null;
} 
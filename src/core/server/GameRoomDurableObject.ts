// Type declarations for Cloudflare Workers runtime
declare global {
  interface DurableObjectState {
    id: DurableObjectId;
    storage: DurableObjectStorage;
    waitUntil(promise: Promise<any>): void;
    blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
  }
  
  interface DurableObjectId {
    toString(): string;
    equals(other: DurableObjectId): boolean;
  }
  
  interface DurableObjectStorage {
    get<T = unknown>(key: string): Promise<T | undefined>;
    put<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<boolean>;
    list<T = unknown>(options?: { start?: string; end?: string; prefix?: string; reverse?: boolean; limit?: number }): Promise<Map<string, T>>;
  }
  
  class DurableObject {
    constructor(state: DurableObjectState, env: any);
  }
  
  interface WebSocketPair {
    0: WebSocket;
    1: WebSocket;
  }
  
  var WebSocketPair: {
    new (): WebSocketPair;
  };
  
  interface ResponseInit {
    webSocket?: WebSocket;
  }
}

import type { 
  MultiplayerGameState, 
  WebSocketMessage, 
  PlayerInfo,
  GameMoveMessage
} from '../../games/bagchal/types/multiplayer';
import { executeMove, generatePoints, generateLines, buildAdjacencyMap } from '../../games/bagchal/rules';

// Runtime stub: during Node prerender the global DurableObject doesn't exist.
// Define a no-op base class so that the `extends DurableObject` below doesn't throw.
if (typeof (globalThis as any).DurableObject === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
  (globalThis as any).DurableObject = class { constructor(..._args: any[]) {} };
}

// Simplified game logic since we can't import complex modules in DO
interface GameMove {
  from?: number;
  to: number;
  jumpedGoatId?: number;
  moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE';
}

export class GameRoomDurableObject extends DurableObject {
  private sessions: Map<WebSocket, string> = new Map();
  private gameState: MultiplayerGameState | null = null;
  private roomId: string;
  
  // Pre-computed game constants
  private points = generatePoints();
  private lines = generateLines(this.points);
  private adjacency = buildAdjacencyMap(this.points, this.lines);

  constructor(state: DurableObjectState, env: any) {
    super(state, env);
    this.roomId = state.id.toString();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/websocket') {
      return this.handleWebSocketUpgrade(request);
    }
    
    if (url.pathname === '/state') {
      return this.handleGetState();
    }
    
    return new Response('Not found', { status: 404 });
  }

  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const playerId = url.searchParams.get('playerId');
    
    if (!playerId) {
      return new Response('Missing playerId', { status: 400 });
    }

    try {
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      this.handleWebSocketConnection(server as WebSocket, playerId);
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    } catch (error) {
      console.error('WebSocket upgrade error:', error);
      return new Response('WebSocket upgrade failed', { status: 500 });
    }
  }

  private handleWebSocketConnection(webSocket: WebSocket, playerId: string) {
    try {
      (webSocket as any).accept();
      this.sessions.set(webSocket, playerId);

      // Initialize game state if needed
      if (!this.gameState) {
        this.initializeGameState(playerId);
      }

      // Send current game state
      if (this.gameState) {
        this.sendToPlayer(playerId, {
          type: 'GAME_STATE',
          timestamp: Date.now(),
          playerId: 'system',
          gameState: this.gameState
        });
      }

      webSocket.addEventListener('message', (event: MessageEvent) => {
        this.handleWebSocketMessage(webSocket, playerId, event.data);
      });

      webSocket.addEventListener('close', () => {
        this.handleWebSocketClose(webSocket, playerId);
      });

      webSocket.addEventListener('error', (error: Event) => {
        console.error('WebSocket error:', error);
        this.handleWebSocketClose(webSocket, playerId);
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  private handleWebSocketMessage(webSocket: WebSocket, playerId: string, data: string) {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'GAME_MOVE':
          this.handleGameMove(message);
          break;
          
        case 'PING':
          this.sendToPlayer(playerId, {
            type: 'PONG',
            timestamp: Date.now(),
            playerId: 'system'
          });
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.sendError(playerId, 'Invalid message format');
    }
  }

  private handleWebSocketClose(webSocket: WebSocket, playerId: string) {
    this.sessions.delete(webSocket);
    
    if (this.gameState && this.gameState.players[playerId]) {
      this.gameState.players[playerId].connected = false;
      this.gameState.players[playerId].lastSeen = Date.now();
    }
  }

  private handleGameMove(message: any) {
    if (!this.gameState) {
      this.sendError(message.playerId, 'Game not initialized');
      return;
    }

    // Validate message has required fields
    if (!message.move || !message.playerId) {
      this.sendError(message.playerId, 'Invalid move message');
      return;
    }

    // Validate it's the player's turn
    if (this.gameState.currentPlayerId !== message.playerId) {
      this.sendError(message.playerId, 'Not your turn');
      return;
    }

    try {
      const move: GameMove = message.move;
      const newGameState = JSON.parse(JSON.stringify(this.gameState)); // Deep clone
      
      if (move.moveType === 'PLACEMENT') {
        // Handle goat placement
        newGameState.board[move.to] = 'GOAT';
        newGameState.goatsPlaced++;
        
        if (newGameState.goatsPlaced >= 20) {
          newGameState.phase = 'MOVEMENT';
        }
        
        newGameState.turn = 'TIGER';
        newGameState.currentPlayerId = this.getPlayerIdByRole('TIGER');
      } else {
        // Handle movement/capture - simplified logic
        if (move.from !== undefined) {
          newGameState.board[move.from] = null;
        }
        newGameState.board[move.to] = newGameState.turn;
        
        if (move.jumpedGoatId !== null && move.jumpedGoatId !== undefined) {
          newGameState.board[move.jumpedGoatId] = null;
          newGameState.goatsCaptured++;
        }
        
        newGameState.turn = newGameState.turn === 'GOAT' ? 'TIGER' : 'GOAT';
        newGameState.currentPlayerId = this.getPlayerIdByRole(newGameState.turn);
      }

      newGameState.lastSyncTimestamp = Date.now();
      this.gameState = newGameState;

      // Broadcast updated state
      if (this.gameState) {
        this.broadcast({
          type: 'GAME_STATE',
          timestamp: Date.now(),
          playerId: 'system',
          gameState: this.gameState
        });
      }

      // Check for game end
      if (this.gameState && this.gameState.winner) {
        this.broadcast({
          type: 'GAME_END',
          timestamp: Date.now(),
          playerId: 'system',
          winner: this.gameState.winner,
          reason: 'win'
        });
      }

    } catch (error) {
      console.error('Error executing move:', error);
      this.sendError(message.playerId, 'Failed to execute move');
    }
  }

  private initializeGameState(hostPlayerId: string) {
    // Create initial Reforged game state
    this.gameState = {
      // Base game state
      board: Array(25).fill(null),
      turn: 'GOAT',
      phase: 'PLACEMENT',
      goatsPlaced: 0,
      goatsCaptured: 0,
      winner: null,
      selectedPieceId: null,
      validMoves: [],
      message: 'Waiting for players...',
      positionHistory: [],
      positionCounts: new Map(),
      mode: 'REFORGED',
      movesWithoutCapture: 0,
      
      // Multiplayer specific
      roomId: this.roomId,
      roomCode: this.generateRoomCode(),
      hostPlayerId: hostPlayerId,
      guestPlayerId: null,
      currentPlayerId: hostPlayerId,
      isHost: true,
      connectionStatus: 'connected',
      lastSyncTimestamp: Date.now(),
      players: {
        [hostPlayerId]: {
          id: hostPlayerId,
          name: 'Host Player',
          role: 'GOAT',
          connected: true,
          lastSeen: Date.now()
        }
      }
    };
  }

  private generateRoomCode(): string {
    const adjectives = ['BRAVE', 'SWIFT', 'CLEVER', 'MIGHTY', 'WILD'];
    const animals = ['TIGER', 'GOAT', 'EAGLE', 'WOLF', 'BEAR'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    
    return `${adj}-${animal}-${numbers}`;
  }

  private getPlayerIdByRole(role: 'GOAT' | 'TIGER'): string {
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }
    
    for (const [playerId, player] of Object.entries(this.gameState.players)) {
      if (player.role === role) {
        return playerId;
      }
    }
    throw new Error(`No player found with role ${role}`);
  }

  private async handleGetState(): Promise<Response> {
    if (!this.gameState) {
      return new Response(JSON.stringify({ error: 'Game not initialized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(this.gameState), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // WebSocket utility methods
  private sendToPlayer(playerId: string, message: WebSocketMessage) {
    for (const [ws, wsPlayerId] of this.sessions.entries()) {
      if (wsPlayerId === playerId) {
        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('Error sending message to player:', error);
        }
        break;
      }
    }
  }

  private broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    for (const [ws] of this.sessions.entries()) {
      try {
        ws.send(messageStr);
      } catch (error) {
        console.error('Error broadcasting message:', error);
      }
    }
  }

  private sendError(playerId: string, error: string, code?: string) {
    this.sendToPlayer(playerId, {
      type: 'ERROR',
      timestamp: Date.now(),
      playerId: 'system',
      error,
      code
    });
  }
} 
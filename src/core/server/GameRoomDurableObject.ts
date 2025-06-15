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
import { executeMove, generatePoints, generateLines, buildAdjacencyMap, validateMove } from '../../games/bagchal/rules';
import { verifyToken } from '../../lib/utils/auth';

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
  private stateStorage: DurableObjectStorage;
  private envVars: any;
  private db: any;
  private durableState: DurableObjectState;
  /**
   * Tracks the version returned from the last successful write to D1. This is used for
   * optimistic-concurrency control when multiple isolates of the same Durable Object
   * are spawned (e.g. during redeploys) and attempt to persist state simultaneously.
   */
  private lastPersistedVersion = 0;
  
  // Pre-computed game constants
  private points = generatePoints();
  private lines = generateLines(this.points);
  private adjacency = buildAdjacencyMap(this.points, this.lines);

  constructor(state: DurableObjectState, env: any) {
    super(state, env);
    this.roomId = state.id.toString();
    this.stateStorage = state.storage;
    this.durableState = state;
    this.envVars = env;
    this.db = env.DB; // D1 binding injected via Wrangler
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
    const roomCode: string = url.searchParams.get('roomCode') || this.roomId;
    const token = url.searchParams.get('token');
    
    // Verify auth token
    if (!token) {
      return new Response('Missing token', { status: 401 });
    }

    const secret = (this.envVars as any)?.JWT_SECRET as string | undefined;
    if (!secret) {
      return new Response('Server misconfiguration', { status: 500 });
    }

    const verified = await verifyToken(token, secret);
    if (!verified || verified.playerId !== playerId || verified.roomCode !== roomCode) {
      return new Response('Invalid token', { status: 403 });
    }

    if (!playerId) {
      return new Response('Missing playerId', { status: 400 });
    }

    try {
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair) as [WebSocket, WebSocket];

      // FIXED: Accept after setting up connection handlers
      await this.setupWebSocketConnection(server as WebSocket, playerId as string, roomCode);
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    } catch (error) {
      console.error('WebSocket upgrade error:', error);
      return new Response('WebSocket upgrade failed', { status: 500 });
    }
  }

  private async setupWebSocketConnection(webSocket: WebSocket, playerId: string, roomCode: string) {
    try {
      console.log(`🔌 Setting up WebSocket for player ${playerId} in room ${roomCode}`);

      // Set up event listeners BEFORE accepting
      webSocket.addEventListener('message', (event: MessageEvent) => {
        console.log(`📨 Received message from player ${playerId}:`, JSON.parse(event.data).type);
        try {
          this.handleWebSocketMessage(webSocket, playerId, event.data);
        } catch (error) {
          console.error(`❌ Error handling message from ${playerId}:`, error);
          this.sendError(playerId, 'Message processing failed');
        }
      });

      webSocket.addEventListener('close', (event: CloseEvent) => {
        console.log(`🔴 WebSocket closed for player ${playerId}:`, event.code, event.reason);
        this.handleWebSocketClose(webSocket, playerId);
      });

      webSocket.addEventListener('error', (error: Event) => {
        console.error(`❌ WebSocket error for player ${playerId}:`, error);
      });

      // NOW accept the WebSocket after listeners are set up
      (webSocket as any).accept();
      
      // Register the session
      this.sessions.set(webSocket, playerId);
      console.log(`✅ WebSocket connection established for player ${playerId}`);

      // Load or initialize game state
      if (!this.gameState) {
        const persisted = await this.stateStorage.get<MultiplayerGameState>('gameState');
        if (persisted) {
          this.gameState = persisted;
          console.log(`📁 Loaded persisted game state for room ${roomCode}`);
        }
      }

      // Initialize game state if needed
      if (!this.gameState) {
        const hostName = (await this.fetchPlayerName(playerId)) ?? 'Host Player';
        this.initializeGameState(roomCode, playerId, hostName, 'GOAT');
        console.log(`🎮 Initialized new game state for room ${roomCode}`);
      }

      // Add player if not already in game
      if (this.gameState && !this.gameState.players[playerId]) {
        const joinedName = (await this.fetchPlayerName(playerId)) ?? 'Guest Player';
        const availableRoles = Object.values(this.gameState.players).map(p => p.role);
        const assignedRole = availableRoles.includes('GOAT' as any) ? 'TIGER' : 'GOAT';
        
        this.gameState.players[playerId] = {
          id: playerId,
          name: joinedName,
          role: assignedRole as 'GOAT' | 'TIGER',
          connected: true,
          lastSeen: Date.now()
        };

        // Set guest player ID and update current player if needed
        if (assignedRole === 'TIGER') {
          this.gameState.guestPlayerId = playerId;
        }
        
        // Update current player ID to match current turn
        this.gameState.currentPlayerId = this.getPlayerIdByRole(this.gameState.turn);
        this.gameState.lastSyncTimestamp = Date.now();
        
        console.log(`👤 Player ${playerId} joined as ${assignedRole}`);
      }

      // Send current game state to the connecting player
      if (this.gameState) {
        this.sendToPlayer(playerId, {
          type: 'GAME_STATE',
          timestamp: Date.now(),
          playerId: 'system',
          gameState: this.gameState
        });
      }

      // Persist the updated state
      if (this.gameState) {
        this.stateStorage.put('gameState', this.gameState).catch((e) => 
          console.error('Failed to persist state:', e)
        );
      }

    } catch (error) {
      console.error(`❌ WebSocket connection setup failed for player ${playerId}:`, error);
      throw error;
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

    console.log(`🎮 Processing move from player ${message.playerId}`);
    console.log(`🎯 Current turn: ${this.gameState.turn}, Current player: ${this.gameState.currentPlayerId}`);
    console.log(`🎭 Player role: ${this.gameState.players[message.playerId]?.role}`);
    console.log(`📋 Move:`, message.move);

    // Validate it's the player's turn and move legality using shared rules
    if (this.gameState.currentPlayerId !== message.playerId) {
      console.log(`❌ Turn validation failed: expected ${this.gameState.currentPlayerId}, got ${message.playerId}`);
      this.sendError(message.playerId, 'Not your turn');
      return;
    }

    // Full rules validation (pure, no mutations)
    const { valid, reason } = validateMove(
      this.gameState,
      message.move,
      this.adjacency,
      this.points
    );
    if (!valid) {
      this.sendError(message.playerId, reason || 'Illegal move');
      return;
    }

    try {
      // Use structuredClone so that Map & Date objects are preserved
      // (Cloudflare workers runtime supports structuredClone)
      const newGameState: MultiplayerGameState = (globalThis as any).structuredClone
        ? (structuredClone(this.gameState) as MultiplayerGameState)
        : JSON.parse(JSON.stringify(this.gameState));

      const move: GameMove = message.move;
      if (move.moveType === 'PLACEMENT') {
        // Validate placement - only GOATs can place and only during placement phase
        if (newGameState.phase !== 'PLACEMENT') {
          this.sendError(message.playerId, 'Not in placement phase');
          return;
        }
        
        // Verify the player making the move actually has the GOAT role
        const player = newGameState.players[message.playerId];
        if (!player || player.role !== 'GOAT') {
          this.sendError(message.playerId, 'Only goat players can place pieces');
          return;
        }
        
        if (newGameState.board[move.to] !== null) {
          this.sendError(message.playerId, 'Position occupied');
          return;
        }
        
        newGameState.board[move.to] = 'GOAT';
        newGameState.goatsPlaced++;
        
        // Transition to movement phase when all goats are placed
        if (newGameState.goatsPlaced >= 20) {
          newGameState.phase = 'MOVEMENT';
          // After all goats placed, tigers move first in movement phase
          newGameState.turn = 'TIGER';
          newGameState.currentPlayerId = this.getPlayerIdByRole('TIGER');
        } else {
          // During placement, goats continue placing (don't switch turns)
          newGameState.turn = 'GOAT';
          newGameState.currentPlayerId = this.getPlayerIdByRole('GOAT');
        }
      } else {
        // Use shared executeMove for movement/capture validation & update
        if (move.from === undefined || move.from === null) {
          this.sendError(message.playerId, 'Missing from');
          return;
        }
        try {
          executeMove(
            newGameState,
            move.from,
            move.to,
            move.jumpedGoatId ?? null,
            this.adjacency,
            this.points
          );
        } catch (err) {
          console.error('Move execution failed', err);
          this.sendError(message.playerId, 'Illegal move');
          return;
        }
        // currentPlayerId already adjusted inside executeMove via turn switch
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

      // ACK system removed for simplicity

      // Atomically persist to D1 (fire-and-forget; DO will retry on failure via waitUntil)
      this.persistState().catch((err) => console.error('Failed to persist game state', err));

      // Also keep a copy in Durable Object storage for fast cold-start
      this.stateStorage.put('gameState', this.gameState).catch((e) => console.error('storage.put failed', e));

    } catch (error) {
      console.error('Error executing move:', error);
      this.sendError(message.playerId, 'Failed to execute move');
    }
  }

  private initializeGameState(roomCode: string, hostPlayerId: string, hostName: string, hostRole: 'GOAT' | 'TIGER') {
    // Create initial Reforged game state
    this.gameState = {
      // Base game state
      board: (() => {
        const b = Array(25).fill(null);
        // Place tigers at the four corners (0, 4, 20, 24)
        [0, 4, 20, 24].forEach((idx) => (b[idx] = 'TIGER'));
        return b;
      })(),
      turn: 'GOAT', // GOATs always start placement phase
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
      roomCode,
      hostPlayerId: hostPlayerId,
      guestPlayerId: null,
      // Set currentPlayerId to GOAT player if host is GOAT, otherwise will be set when guest joins
      currentPlayerId: hostRole === 'GOAT' ? hostPlayerId : hostPlayerId, // Fallback to host for now
      isHost: true,
      connectionStatus: 'connected',
      lastSyncTimestamp: Date.now(),
      players: {
        [hostPlayerId]: {
          id: hostPlayerId,
          name: hostName,
          role: hostRole,
          connected: true,
          lastSeen: Date.now()
        }
      }
    } as MultiplayerGameState;
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

  /**
   * Persist latest state into D1 with optimistic concurrency control.
   * The schema is
   * CREATE TABLE IF NOT EXISTS room_state (
   *   id TEXT PRIMARY KEY,
   *   blob TEXT NOT NULL,
   *   version INTEGER NOT NULL DEFAULT 0
   * );
   */
  private async persistState() {
    if (!this.gameState) return;

    const blob = JSON.stringify(this.gameState);
    const id = this.roomId;

    // Ensure only one persist runs at a time inside this DO instance
    await this.durableState.blockConcurrencyWhile(async () => {
      let attempt = 0;
      const MAX_ATTEMPTS = 5;
      let currentVersion = this.lastPersistedVersion;

      while (attempt < MAX_ATTEMPTS) {
        attempt++;
        try {
          // INSERT a new row if it does not exist yet – otherwise UPDATE using optimistic concurrency
          const info = (await this.db
            .prepare(
              `INSERT INTO room_state (id, blob, version)
               VALUES (?1, ?2, 1)
               ON CONFLICT(id) DO UPDATE SET
                 blob   = excluded.blob,
                 version = CASE WHEN room_state.version = ?3 THEN room_state.version + 1 ELSE room_state.version END
               RETURNING version` as string
            )
            .bind(id, blob, currentVersion)
            .first()) as { version?: number } | undefined;

          const newVersion = info?.version ?? null;

          // If `version` did not advance, a concurrent writer beat us – reload & retry
          if (newVersion === null || newVersion === currentVersion) {
            // fetch existing version
            const existing = (await this.db
              .prepare(`SELECT version FROM room_state WHERE id = ?1` as string)
              .bind(id)
              .first()) as { version?: number } | undefined;
            currentVersion = existing?.version ?? 0;
            await new Promise((r) => setTimeout(r, 25 * attempt)); // brief backoff
            continue;
          }

          // Success – store latest version & exit loop
          this.lastPersistedVersion = newVersion;
          console.log('State persisted – version', newVersion);
          break;
        } catch (err) {
          console.error('persistState attempt failed', err);
          if (attempt >= MAX_ATTEMPTS) throw err;
          await new Promise((r) => setTimeout(r, 50 * attempt)); // exponential backoff
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // Helper: fetch player name from the Players table (best-effort)
  // -------------------------------------------------------------------------
  private async fetchPlayerName(playerId: string): Promise<string | undefined> {
    try {
      if (!this.db) return undefined;
      const row = (await this.db
        .prepare('SELECT name FROM players WHERE id = ?1' as string)
        .bind(playerId)
        .first()) as { name?: string } | undefined;
      return row?.name;
    } catch (err) {
      console.error('Failed to fetch player name', err);
      return undefined;
    }
  }
} 
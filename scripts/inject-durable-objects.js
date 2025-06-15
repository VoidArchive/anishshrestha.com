#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Paths
const workerPath = path.join(projectRoot, '.svelte-kit/cloudflare/_worker.js');

console.log('🔧 Injecting Durable Objects into worker...');

// Check if worker file exists
if (!fs.existsSync(workerPath)) {
  console.error('❌ Worker file not found:', workerPath);
  process.exit(1);
}

// Read the worker file
let workerContent = fs.readFileSync(workerPath, 'utf8');

// Create a hand-written JavaScript implementation of the Durable Object
const durableObjectCode = `
// Durable Object for multiplayer game rooms
class GameRoomDurableObject extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.gameState = null;
    this.roomId = state.id.toString();
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/websocket') {
      return this.handleWebSocketUpgrade(request);
    }
    
    if (url.pathname === '/state') {
      return this.handleGetState();
    }
    
    return new Response('Not found', { status: 404 });
  }

  async handleWebSocketUpgrade(request) {
    const url = new URL(request.url);
    const playerId = url.searchParams.get('playerId');
    
    if (!playerId) {
      return new Response('Missing playerId', { status: 400 });
    }

    try {
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      this.handleWebSocketConnection(server, playerId);
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    } catch (error) {
      console.error('WebSocket upgrade error:', error);
      return new Response('WebSocket upgrade failed', { status: 500 });
    }
  }

  handleWebSocketConnection(webSocket, playerId) {
    try {
      webSocket.accept();
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

      webSocket.addEventListener('message', (event) => {
        this.handleWebSocketMessage(webSocket, playerId, event.data);
      });

      webSocket.addEventListener('close', () => {
        this.handleWebSocketClose(webSocket, playerId);
      });

      webSocket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleWebSocketClose(webSocket, playerId);
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  handleWebSocketMessage(webSocket, playerId, data) {
    try {
      const message = JSON.parse(data);
      
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

  handleWebSocketClose(webSocket, playerId) {
    this.sessions.delete(webSocket);
    
    if (this.gameState && this.gameState.players[playerId]) {
      this.gameState.players[playerId].connected = false;
      this.gameState.players[playerId].lastSeen = Date.now();
    }
  }

  handleGameMove(message) {
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
      const move = message.move;
      const newGameState = JSON.parse(JSON.stringify(this.gameState));
      
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
        // Handle movement/capture - simplified for now
        newGameState.board[move.from] = null;
        newGameState.board[move.to] = newGameState.turn;
        
        if (move.jumpedGoatId !== null) {
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

  initializeGameState(hostPlayerId) {
    this.gameState = {
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

  generateRoomCode() {
    const adjectives = ['BRAVE', 'SWIFT', 'CLEVER', 'MIGHTY', 'WILD'];
    const animals = ['TIGER', 'GOAT', 'EAGLE', 'WOLF', 'BEAR'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    
    return \`\${adj}-\${animal}-\${numbers}\`;
  }

  getPlayerIdByRole(role) {
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }
    
    for (const [playerId, player] of Object.entries(this.gameState.players)) {
      if (player.role === role) {
        return playerId;
      }
    }
    throw new Error(\`No player found with role \${role}\`);
  }

  async handleGetState() {
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

  sendToPlayer(playerId, message) {
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

  broadcast(message) {
    const messageStr = JSON.stringify(message);
    for (const [ws] of this.sessions.entries()) {
      try {
        ws.send(messageStr);
      } catch (error) {
        console.error('Error broadcasting message:', error);
      }
    }
  }

  sendError(playerId, error, code = null) {
    this.sendToPlayer(playerId, {
      type: 'ERROR',
      timestamp: Date.now(),
      playerId: 'system',
      error,
      code
    });
  }
}

// Export the Durable Object class
export { GameRoomDurableObject };
`;

// Append the Durable Object to the worker
const modifiedWorkerContent = workerContent + '\n' + durableObjectCode;

// Write the modified worker back
fs.writeFileSync(workerPath, modifiedWorkerContent);

console.log('✅ Successfully injected GameRoomDurableObject into worker');
console.log('📁 Modified file:', workerPath); 
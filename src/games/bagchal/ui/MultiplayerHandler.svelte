<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { 
    WebSocketMessage, 
    MultiplayerGameState, 
    ConnectionStatus,
    CreateRoomRequest,
    JoinRoomRequest
  } from '../types/multiplayer';

  // Props
  interface Props {
    gameMode: 'CLASSIC' | 'REFORGED';
    onGameStateUpdate?: (gameState: MultiplayerGameState) => void;
    onConnectionStatusChange?: (status: ConnectionStatus) => void;
    onError?: (error: string) => void;
  }

  let {
    gameMode = 'REFORGED',
    onGameStateUpdate,
    onConnectionStatusChange,
    onError
  }: Props = $props();

  // Connection state
  let websocket: WebSocket | null = $state(null);
  let connectionStatus: ConnectionStatus = $state('disconnected');
  let roomId: string | null = $state(null);
  let roomCode: string | null = $state(null);
  let playerId: string | null = $state(null);
  let playerRole: 'GOAT' | 'TIGER' | null = $state(null);
  let gameState: MultiplayerGameState | null = $state(null);

  // Reconnection logic
  let reconnectAttempts = $state(0);
  let maxReconnectAttempts = 5;
  let reconnectTimeout: number | null = null;

  // Ping/Pong for connection health
  let pingInterval: number | null = null;
  let lastPongReceived = $state(Date.now());

  /**
   * Create a new multiplayer room
   */
  export async function createRoom(playerName: string): Promise<{ roomCode: string; playerId: string } | null> {
    try {
      updateConnectionStatus('connecting');
      
      const request: CreateRoomRequest = {
        playerName,
        gameMode: 'REFORGED'
      };

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create room');
      }

      const data = await response.json();
      
      roomId = data.roomId;
      roomCode = data.roomCode;
      playerId = data.playerId;
      playerRole = data.role;

      // Connect to WebSocket for real-time communication
      await connectWebSocket();

      return { roomCode: data.roomCode, playerId: data.playerId };

    } catch (error) {
      console.error('Error creating room:', error);
      updateConnectionStatus('error');
      onError?.(error instanceof Error ? error.message : 'Failed to create room');
      return null;
    }
  }

  /**
   * Join an existing multiplayer room
   */
  export async function joinRoom(roomCode: string, playerName: string): Promise<boolean> {
    try {
      updateConnectionStatus('connecting');
      
      const request: JoinRoomRequest = {
        roomCode,
        playerName
      };

      const response = await fetch(`/api/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join room');
      }

      const data = await response.json();
      
      roomId = data.roomId;
      playerId = data.playerId;
      playerRole = data.role;
      gameState = data.gameState;

      // Connect to WebSocket
      await connectWebSocket();

      return true;

    } catch (error) {
      console.error('Error joining room:', error);
      updateConnectionStatus('error');
      onError?.(error instanceof Error ? error.message : 'Failed to join room');
      return false;
    }
  }

  /**
   * Send a move to the server
   */
  export function sendMove(move: {
    from: number | null;
    to: number;
    jumpedGoatId?: number | null;
    moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE';
  }): void {
    if (!websocket || websocket.readyState !== WebSocket.OPEN || !playerId) {
      console.error('Cannot send move: WebSocket not connected');
      return;
    }

    const message: WebSocketMessage = {
      type: 'GAME_MOVE',
      timestamp: Date.now(),
      playerId,
      move
    };

    websocket.send(JSON.stringify(message));
  }

  /**
   * Disconnect from the current room
   */
  export function disconnect(): void {
    if (websocket) {
      websocket.close();
    }
    
    resetConnection();
  }

  /**
   * Connect to WebSocket for real-time communication
   */
  async function connectWebSocket(): Promise<void> {
    if (!roomId || !playerId) {
      throw new Error('Missing room ID or player ID');
    }

    try {
      // Use proper WebSocket URL based on current location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws?roomId=${roomId}&playerId=${playerId}`;
      
      websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('WebSocket connected');
        updateConnectionStatus('connected');
        reconnectAttempts = 0;
        startPingInterval();
      };

      websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        stopPingInterval();
        
        if (connectionStatus === 'connected') {
          updateConnectionStatus('reconnecting');
          attemptReconnect();
        } else {
          updateConnectionStatus('disconnected');
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateConnectionStatus('error');
      };

    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      updateConnectionStatus('error');
      throw error;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  function handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'GAME_STATE':
        if ('gameState' in message) {
          gameState = message.gameState;
          onGameStateUpdate?.(message.gameState);
        }
        break;

      case 'GAME_END':
        if ('winner' in message) {
          console.log('Game ended:', message.winner, message.reason);
        }
        break;

      case 'PLAYER_JOIN':
        if ('playerInfo' in message) {
          console.log('Player joined:', message.playerInfo);
        }
        break;

      case 'PLAYER_LEAVE':
        console.log('Player left:', message.playerId);
        break;

      case 'ERROR':
        if ('error' in message) {
          console.error('Server error:', message.error);
          onError?.(message.error);
        }
        break;

      case 'PONG':
        lastPongReceived = Date.now();
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  function attemptReconnect(): void {
    if (reconnectAttempts >= maxReconnectAttempts) {
      updateConnectionStatus('error');
      onError?.('Connection lost. Please refresh the page.');
      return;
    }

    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // Exponential backoff

    reconnectTimeout = setTimeout(async () => {
      try {
        await connectWebSocket();
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
        attemptReconnect();
      }
    }, delay);
  }

  /**
   * Start ping interval to check connection health
   */
  function startPingInterval(): void {
    pingInterval = setInterval(() => {
      if (websocket && websocket.readyState === WebSocket.OPEN && playerId) {
        const pingMessage: WebSocketMessage = {
          type: 'PING',
          timestamp: Date.now(),
          playerId
        };
        websocket.send(JSON.stringify(pingMessage));

        // Check if we received a pong recently
        if (Date.now() - lastPongReceived > 30000) { // 30 seconds
          console.warn('Connection may be lost - no pong received');
          websocket.close();
        }
      }
    }, 10000); // Ping every 10 seconds
  }

  /**
   * Stop ping interval
   */
  function stopPingInterval(): void {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  }

  /**
   * Update connection status and notify parent
   */
  function updateConnectionStatus(status: ConnectionStatus): void {
    connectionStatus = status;
    onConnectionStatusChange?.(status);
  }

  /**
   * Reset connection state
   */
  function resetConnection(): void {
    websocket = null;
    roomId = null;
    roomCode = null;
    playerId = null;
    playerRole = null;
    gameState = null;
    reconnectAttempts = 0;
    updateConnectionStatus('disconnected');
    
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    stopPingInterval();
  }

  // Cleanup on component destroy
  onDestroy(() => {
    disconnect();
  });

  // Expose current state for parent components
  export function getCurrentState() {
    return {
      connectionStatus,
      roomId,
      roomCode,
      playerId,
      playerRole,
      gameState,
      isConnected: connectionStatus === 'connected'
    };
  }
</script>

<!-- No template needed - this is a headless component for multiplayer logic --> 
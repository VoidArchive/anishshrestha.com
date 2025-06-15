import type { MultiplayerGameState, WebSocketMessage } from '../../games/bagchal/types/multiplayer';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface WebSocketClientOptions {
  onGameStateUpdate: (gameState: MultiplayerGameState) => void;
  onConnectionStatusChange: (status: ConnectionStatus) => void;
  onError: (error: string) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private roomId: string | null = null;
  private playerId: string | null = null;
  private authToken: string | undefined;
  private status: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: number | null = null;
  private shouldReconnect = true;

  constructor(private options: WebSocketClientOptions) {}

  async connect(roomId: string, playerId: string, authToken?: string): Promise<boolean> {
    // Treat this as a new connection request; enable automatic reconnection
    // until an explicit `disconnect()` happens again.
    this.shouldReconnect = true;
    this.roomId = roomId;
    this.playerId = playerId;
    this.authToken = authToken;
    
    try {
      this.setStatus('connecting');
      
      // Get Durable Object URL from our API
      const response = await fetch(`/api/rooms/${roomId}/websocket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, authToken })
      });

      if (!response.ok) {
        throw new Error('Failed to get WebSocket URL');
      }

      const { websocketUrl } = await response.json();
      
      // Connect to the Durable Object WebSocket
      this.ws = new WebSocket(websocketUrl);
      
      this.ws.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        this.startPingInterval();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.stopPingInterval();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.setStatus('error');
        this.options.onError('Connection error occurred');
      };

      return true;
    } catch (error) {
      console.error('Failed to connect:', error);
      this.setStatus('error');
      this.options.onError('Failed to connect to game room');
      return false;
    }
  }

  sendMove(move: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'GAME_MOVE',
        timestamp: Date.now(),
        playerId: this.playerId!,
        move
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  private handleMessage(data: string) {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'GAME_STATE':
          if (message.gameState) {
            this.options.onGameStateUpdate(message.gameState);
          }
          break;
          
        case 'ERROR':
          this.options.onError(message.error || 'Unknown error');
          break;
          
        case 'PONG':
          // Heartbeat response - connection is alive
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.options.onConnectionStatusChange(status);
  }

  private startPingInterval() {
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const pingMessage: WebSocketMessage = {
          type: 'PING',
          timestamp: Date.now(),
          playerId: this.playerId!
        };
        this.ws.send(JSON.stringify(pingMessage));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect() {
    if (!this.shouldReconnect) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts && this.roomId && this.playerId) {
      this.reconnectAttempts++;
      this.setStatus('reconnecting');
      
      setTimeout(() => {
        this.connect(this.roomId!, this.playerId!, this.authToken);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getPlayerId(): string | null {
    return this.playerId;
  }
} 
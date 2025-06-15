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
  /**
   * Maximum reconnect attempts. Set to `Infinity` for unlimited attempts. This can
   * be overridden via the constructor options in the future if needed.
   */
  private maxReconnectAttempts = Infinity;

  /**
   * Base delay (ms) for reconnect exponential backoff. The actual delay is
   *   delay = baseDelay * 2 ** attempts  + jitter
   * where jitter is 0–baseDelay to prevent reconnection storms.
   */
  private baseReconnectDelay = 1000;
  private pingInterval: number | null = null;
  private shouldReconnect = true;

  /**
   * Outgoing messages that haven't been acknowledged by the server yet.
   * We store their raw JSON so we can replay them verbatim after a reconnect.
   */
  private pending: any[] = [];

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

        // Flush any pending optimistic messages that haven't been ACKed yet
        for (const pendingMsg of this.pending) {
          this.ws!.send(JSON.stringify(pendingMsg));
        }
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
      const ackId = crypto.randomUUID();
      const message: any = {
        type: 'GAME_MOVE',
        timestamp: Date.now(),
        playerId: this.playerId!,
        move,
        ackId
      };
      this.pending.push(message);
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
      const message: any = JSON.parse(data);
      
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
          
        case 'ACK':
          if (message.ackId) {
            this.handleAck(message.ackId);
          }
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  private handleAck(ackId: string) {
    this.pending = this.pending.filter((m) => m.ackId !== ackId);
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

      // Calculate exponential backoff with jitter
      const expDelay = this.baseReconnectDelay * 2 ** (this.reconnectAttempts - 1);
      const jitter = Math.random() * this.baseReconnectDelay;
      const delay = Math.min(expDelay + jitter, 30000); // Cap at 30s

      setTimeout(() => {
        this.connect(this.roomId!, this.playerId!, this.authToken);
      }, delay);
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getPlayerId(): string | null {
    return this.playerId;
  }
} 
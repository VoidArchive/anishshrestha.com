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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('WebSocket URL request failed:', response.status, errorData);
        throw new Error(`Failed to get WebSocket URL: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      const { websocketUrl } = data;
      
      if (!websocketUrl) {
        throw new Error('No WebSocket URL returned from server');
      }
      
      console.log('Connecting to WebSocket:', websocketUrl);
      
      // Connect to the Durable Object WebSocket
      this.ws = new WebSocket(websocketUrl);
      
      // Add a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.error('WebSocket connection timeout');
          this.ws.close();
          this.setStatus('error');
          this.options.onError('Connection timeout');
        }
      }, 10000); // 10 second timeout
      
      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket connected successfully');
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        this.startPingInterval();

        // Flush any pending optimistic messages that haven't been ACKed yet
        for (const pendingMsg of this.pending) {
          console.log('Replaying pending message:', pendingMsg);
          this.ws!.send(JSON.stringify(pendingMsg));
        }
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('🔴 WebSocket closed:', event.code, event.reason);
        console.log('🔍 Close event details:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          shouldReconnect: this.shouldReconnect
        });
        
        this.setStatus('disconnected');
        this.stopPingInterval();
        
        // Attempt reconnect for any abnormal closure
        if (event.code !== 1000 && event.code !== 1001 && this.shouldReconnect) {
          console.log('🔄 Abnormal closure detected, attempting reconnect...');
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
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
    console.log('🎮 sendMove called with:', move);
    
    if (!this.playerId) {
      console.error('❌ No playerId');
      this.options.onError('Player ID not available');
      return;
    }
    
    console.log('🔌 WebSocket check:', {
      hasWs: !!this.ws,
      readyState: this.ws?.readyState,
      OPEN: WebSocket.OPEN,
      isActuallyOpen: this.ws?.readyState === WebSocket.OPEN
    });
    
    if (!this.ws) {
      console.error('❌ No WebSocket object - attempting to reconnect');
      // Try to reconnect immediately
      if (this.roomId && this.playerId) {
        console.log('🔄 Reconnecting before sending move...');
        this.connect(this.roomId, this.playerId, this.authToken).then((success) => {
          if (success) {
            console.log('✅ Reconnected! Retrying move...');
            // Retry the move after successful reconnection
            setTimeout(() => this.sendMove(move), 100);
          } else {
            console.error('❌ Reconnection failed');
            this.options.onError('Failed to reconnect');
          }
        });
      } else {
        this.options.onError('No WebSocket connection');
      }
      return;
    }
    
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not open. State:', this.ws.readyState, 'Expected:', WebSocket.OPEN);
      this.options.onError('WebSocket not open');
      return;
    }
    
    console.log('✅ WebSocket is ready, sending move!');
    
    const ackId = crypto.randomUUID();
    const message: any = {
      type: 'GAME_MOVE',
      timestamp: Date.now(),
      playerId: this.playerId,
      move,
      ackId
    };
    
    console.log('📤 Sending move to server:', message);
    this.pending.push(message);
    
    try {
      this.ws.send(JSON.stringify(message));
      console.log('✅ Move sent successfully');
    } catch (error) {
      console.error('❌ Failed to send move:', error);
      this.options.onError('Failed to send move');
      this.pending = this.pending.filter(m => m.ackId !== ackId);
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
      console.log('📨 Received message:', message.type, message);
      
      switch (message.type) {
        case 'GAME_STATE':
          console.log('🎮 Game state update received');
          if (message.gameState) {
            this.options.onGameStateUpdate(message.gameState);
          }
          break;
          
        case 'ERROR':
          console.log('❌ Server error:', message.error);
          this.options.onError(message.error || 'Unknown error');
          break;
          
        case 'PONG':
          console.log('🏓 Pong received');
          break;
          
        case 'ACK':
          console.log('✅ ACK received:', message.ackId);
          if (message.ackId) {
            this.handleAck(message.ackId);
          }
          break;
          
        default:
          console.warn('❓ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Failed to parse message:', error);
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
        console.log('🏓 Sending ping to keep connection alive');
        this.ws.send(JSON.stringify(pingMessage));
      } else {
        console.warn('⚠️ Cannot send ping - WebSocket not open, state:', this.ws?.readyState);
        if (this.ws && this.ws.readyState === WebSocket.CLOSED) {
          this.stopPingInterval();
          this.attemptReconnect();
        }
      }
    }, 15000); // Ping every 15 seconds (reduced from 30)
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect() {
    if (!this.shouldReconnect) {
      console.log('Reconnection disabled, not attempting reconnect');
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts && this.roomId && this.playerId) {
      this.reconnectAttempts++;
      this.setStatus('reconnecting');

      // Calculate exponential backoff with jitter
      const expDelay = this.baseReconnectDelay * 2 ** (this.reconnectAttempts - 1);
      const jitter = Math.random() * this.baseReconnectDelay;
      const delay = Math.min(expDelay + jitter, 30000); // Cap at 30s

      console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${Math.round(delay)}ms`);

      setTimeout(() => {
        if (this.shouldReconnect && this.status !== 'connected') {
          console.log('Executing reconnection attempt');
          this.connect(this.roomId!, this.playerId!, this.authToken);
        } else {
          console.log('Skipping reconnection - already connected or disabled');
        }
      }, delay);
    } else {
      console.log('Max reconnection attempts reached or missing connection info');
      this.setStatus('error');
      this.options.onError('Failed to reconnect to game server');
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getPlayerId(): string | null {
    return this.playerId;
  }
} 
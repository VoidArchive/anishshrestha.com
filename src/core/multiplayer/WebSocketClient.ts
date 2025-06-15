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
  private maxReconnectAttempts = 3; // FIXED: Limited to 3 attempts
  private baseReconnectDelay = 2000; // FIXED: Increased to 2 seconds
  private pingInterval: number | null = null;
  private shouldReconnect = true;
  private connectionTimeout: number | null = null;

  constructor(private options: WebSocketClientOptions) {}

  async connect(roomId: string, playerId: string, authToken?: string): Promise<boolean> {
    console.log('🔌 Starting connection to room:', roomId);
    
    // Clear any existing connection
    this.disconnect();
    
    this.shouldReconnect = true;
    this.roomId = roomId;
    this.playerId = playerId;
    this.authToken = authToken;
    
    try {
      this.setStatus('connecting');
      
      // Get WebSocket URL from our API
      const response = await fetch(`/api/rooms/${roomId}/websocket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, authToken })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Connection request failed' }));
        console.error('WebSocket URL request failed:', response.status, errorData);
        throw new Error(errorData.error || `Connection failed: ${response.status}`);
      }

      const data = await response.json();
      const { websocketUrl } = data;
      
      if (!websocketUrl) {
        throw new Error('No WebSocket URL returned from server');
      }
      
      console.log('🌐 Connecting to WebSocket:', websocketUrl);
      
      // Create WebSocket connection
      this.ws = new WebSocket(websocketUrl);
      
      // Set up connection timeout
      this.connectionTimeout = window.setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.error('❌ WebSocket connection timeout');
          this.ws.close();
          this.setStatus('error');
          this.options.onError('Connection timeout');
        }
      }, 8000); // 8 second timeout
      
      // Set up event listeners
      this.ws.onopen = () => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        console.log('✅ WebSocket connected successfully');
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        this.startPingInterval();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        console.log('🔴 WebSocket closed:', event.code, event.reason);
        this.setStatus('disconnected');
        this.stopPingInterval();
        
        // Only reconnect on abnormal closure and if we should reconnect
        if (event.code !== 1000 && event.code !== 1001 && this.shouldReconnect) {
          console.log('🔄 Abnormal closure detected, attempting reconnect...');
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        console.error('❌ WebSocket error:', error);
        this.setStatus('error');
        this.options.onError('WebSocket connection error');
      };

      return true;
    } catch (error) {
      console.error('❌ Failed to connect:', error);
      this.setStatus('error');
      this.options.onError(error instanceof Error ? error.message : 'Failed to connect to game room');
      return false;
    }
  }

  sendMove(move: any) {
    console.log('🎮 Sending move:', move);
    
    if (!this.playerId) {
      console.error('❌ No playerId');
      this.options.onError('Player ID not available');
      return;
    }
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not ready. State:', this.ws?.readyState);
      this.options.onError('Connection not ready');
      return;
    }
    
    const message = {
      type: 'GAME_MOVE',
      timestamp: Date.now(),
      playerId: this.playerId,
      move
    };
    
    try {
      this.ws.send(JSON.stringify(message));
      console.log('✅ Move sent successfully');
    } catch (error) {
      console.error('❌ Failed to send move:', error);
      this.options.onError('Failed to send move');
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket client');
    this.shouldReconnect = false;
    this.stopPingInterval();
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.setStatus('disconnected');
  }

  private handleMessage(data: string) {
    try {
      const message: any = JSON.parse(data);
      console.log('📨 Received:', message.type);
      
      switch (message.type) {
        case 'GAME_STATE':
          if (message.gameState) {
            this.options.onGameStateUpdate(message.gameState);
          }
          break;
          
        case 'ERROR':
          console.error('❌ Server error:', message.error);
          this.options.onError(message.error || 'Server error');
          break;
          
        case 'PONG':
          console.log('🏓 Pong received');
          break;
          
        default:
          console.log('❓ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Failed to parse message:', error);
    }
  }

  private setStatus(status: ConnectionStatus) {
    if (this.status !== status) {
      this.status = status;
      this.options.onConnectionStatusChange(status);
    }
  }

  private startPingInterval() {
    this.stopPingInterval(); // Ensure no duplicate intervals
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const pingMessage = {
          type: 'PING',
          timestamp: Date.now(),
          playerId: this.playerId!
        };
        this.ws.send(JSON.stringify(pingMessage));
      } else {
        console.warn('⚠️ Ping failed - WebSocket not open');
        this.stopPingInterval();
        if (this.shouldReconnect) {
          this.attemptReconnect();
        }
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
    if (!this.shouldReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        this.setStatus('error');
        this.options.onError('Failed to reconnect after multiple attempts');
      }
      return;
    }

    if (!this.roomId || !this.playerId) {
      console.error('❌ Missing connection info for reconnect');
      return;
    }

    this.reconnectAttempts++;
    this.setStatus('reconnecting');

    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.shouldReconnect && this.status !== 'connected') {
        this.connect(this.roomId!, this.playerId!, this.authToken);
      }
    }, delay);
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getPlayerId(): string | null {
    return this.playerId;
  }
} 
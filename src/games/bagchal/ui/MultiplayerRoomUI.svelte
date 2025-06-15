<script lang="ts">
  import { WebSocketClient, type ConnectionStatus, type MultiplayerGameState } from '$core/multiplayer';
  import { onDestroy, onMount } from 'svelte';

  interface Props {
    onGameStart: (state: MultiplayerGameState, client: WebSocketClient) => void;
    onError: (error: string) => void;
    onClose?: () => void;
  }

  let { onGameStart, onError, onClose }: Props = $props();

  // WebSocket client
  let wsClient: WebSocketClient | null = null;

  // UI State
  let currentView = $state<'menu' | 'create' | 'join' | 'waiting' | 'connecting'>('menu');
  let playerName = $state('');
  let roomCode = $state('');
  let errorMessage = $state('');
  let isLoading = $state(false);
  let showModal = $state(true);

  // Room state
  let currentRoom = $state<any>(null);
  let connectionStatus = $state<ConnectionStatus>('disconnected');

  function resetForm() {
    playerName = '';
    roomCode = '';
    errorMessage = '';
    isLoading = false;
  }

  function goBack() {
    currentView = 'menu';
    resetForm();
  }

  function validateInput(name: string, code?: string): boolean {
    if (!name.trim()) {
      errorMessage = 'Player name is required';
      return false;
    }
    if (code !== undefined && !code.trim()) {
      errorMessage = 'Room code is required';
      return false;
    }
    return true;
  }

  async function createRoom() {
    if (!validateInput(playerName)) return;

    isLoading = true;
    errorMessage = '';

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          gameMode: 'REFORGED'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const room = await response.json();
      currentRoom = room;
      currentView = 'waiting';
      
      // Start connection to room
      connectToRoom(room.roomCode);
      
    } catch (error) {
      errorMessage = 'Failed to create room. Please try again.';
      console.error('Create room error:', error);
    } finally {
      isLoading = false;
    }
  }

  async function joinRoom() {
    if (!validateInput(playerName, roomCode)) return;

    isLoading = true;
    errorMessage = '';

    try {
      const response = await fetch(`/api/rooms/${roomCode.trim().toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join room');
      }

      const room = await response.json();
      currentRoom = room;
      currentView = 'connecting';
      
      // Start connection to room
      connectToRoom(room.roomCode);
      
    } catch (error: any) {
      errorMessage = error.message || 'Failed to join room. Please check the room code.';
      console.error('Join room error:', error);
    } finally {
      isLoading = false;
    }
  }

  async function connectToRoom(code: string) {
    connectionStatus = 'connecting';
    
    try {
      // Create WebSocket client
      wsClient = new WebSocketClient({
        onGameStateUpdate: (gameState) => {
          onGameStart(gameState, wsClient!);
          showModal = false;
        },
        onConnectionStatusChange: (status) => {
          connectionStatus = status;
        },
        onError: (error) => {
          errorMessage = error;
          onError(error);
        }
      });

      // Use the playerId returned from the room creation / join response if available
      const playerId: string = currentRoom?.playerId ?? `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const authToken: string | undefined = currentRoom?.authToken;
      
      // Connect to the room
      const success = await wsClient.connect(code, playerId, authToken);
      
      if (!success) {
        throw new Error('Failed to establish connection');
      }
      
    } catch (error) {
      connectionStatus = 'disconnected';
      errorMessage = 'Failed to connect to room. Please try again.';
      console.error('Connection error:', error);
    }
  }

  function closeModal() {
    showModal = false;
    onClose?.();
    if (wsClient) {
      wsClient.disconnect();
      wsClient = null;
    }
  }

  // Ensure we always clean up the socket if the user leaves the lobby modal
  onMount(() => {
    const beforeUnload = () => wsClient?.disconnect();
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  });

  onDestroy(() => {
    wsClient?.disconnect();
  });
</script>

{#if showModal}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
  <div class="max-w-lg w-full bg-bg-secondary border border-border">
    <!-- Header -->
    <div class="border-b border-border p-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-text">Bagchal Reforged - Multiplayer</h2>
        <button
          onclick={closeModal}
          class="text-text-muted hover:text-primary transition-colors duration-200 p-1"
          aria-label="Close modal"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-4">
      {#if currentView === 'menu'}
        <div class="text-center space-y-6">
          <p class="text-text-muted">
            Play Bagchal Reforged with friends in real-time multiplayer mode.
          </p>
          
          <div class="space-y-4">
            <button onclick={() => currentView = 'create'} class="w-full btn">
              Create New Room
            </button>
            
            <button onclick={() => currentView = 'join'} class="w-full btn">
              Join Existing Room
            </button>
          </div>
        </div>

      {:else if currentView === 'create'}
        <div class="space-y-4">
          <button onclick={goBack} class="btn text-sm">← Back</button>
          
          <div>
            <h3 class="text-text font-semibold mb-3">Create New Room</h3>
            <div class="space-y-4">
              <div>
                <label for="create-name" class="block text-sm font-medium text-text mb-2">
                  Your Name
                </label>
                <input
                  id="create-name"
                  bind:value={playerName}
                  placeholder="Enter your name"
                  class="w-full px-3 py-2 border border-border bg-bg-primary text-text focus:outline-none focus:border-primary"
                  disabled={isLoading}
                />
              </div>
              
              <button
                onclick={createRoom}
                disabled={isLoading}
                class="w-full btn {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
              >
                {isLoading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </div>
          
          {#if errorMessage}
            <div class="p-3 bg-bg-secondary border border-primary text-primary text-sm">
              {errorMessage}
            </div>
          {/if}
        </div>

      {:else if currentView === 'join'}
        <div class="space-y-4">
          <button onclick={goBack} class="btn text-sm">← Back</button>
          
          <div>
            <h3 class="text-text font-semibold mb-3">Join Room</h3>
            <div class="space-y-4">
              <div>
                <label for="join-name" class="block text-sm font-medium text-text mb-2">
                  Your Name
                </label>
                <input
                  id="join-name"
                  bind:value={playerName}
                  placeholder="Enter your name"
                  class="w-full px-3 py-2 border border-border bg-bg-primary text-text focus:outline-none focus:border-primary"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label for="join-code" class="block text-sm font-medium text-text mb-2">
                  Room Code
                </label>
                <input
                  id="join-code"
                  bind:value={roomCode}
                  placeholder="Enter room code"
                  class="w-full px-3 py-2 border border-border bg-bg-primary text-text focus:outline-none focus:border-primary font-mono text-center uppercase"
                  disabled={isLoading}
                />
              </div>
              
              <button
                onclick={joinRoom}
                disabled={isLoading}
                class="w-full btn {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
              >
                {isLoading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
          
          {#if errorMessage}
            <div class="p-3 bg-bg-secondary border border-primary text-primary text-sm">
              {errorMessage}
            </div>
          {/if}
        </div>

      {:else if currentView === 'waiting'}
        <div class="text-center space-y-4">
          <h3 class="text-text font-semibold">Room Created</h3>
          
          <div class="bg-bg-primary border border-border p-4">
            <p class="text-text-muted text-sm mb-2">Share this code with your friend:</p>
            <div class="text-2xl font-mono text-primary font-bold tracking-widest">
              {currentRoom?.roomCode || 'LOADING'}
            </div>
            <button
              onclick={() => navigator.clipboard.writeText(currentRoom?.roomCode || '')}
              class="btn text-sm mt-2"
            >
              Copy Code
            </button>
          </div>
          
          <div class="text-text-muted text-sm">
            <div class="flex items-center justify-center gap-2">
              <div class="w-2 h-2 bg-primary"></div>
              <span class="capitalize">{connectionStatus}</span>
            </div>
            <p>Waiting for opponent to join...</p>
          </div>
          
          <button onclick={goBack} class="w-full btn">Cancel</button>
        </div>

      {:else if currentView === 'connecting'}
        <div class="text-center space-y-4">
          <h3 class="text-text font-semibold">Connecting to Game</h3>
          
          <div class="flex items-center justify-center gap-2 text-text-muted">
            <div class="w-2 h-2 bg-primary animate-pulse"></div>
            <span>Connecting...</span>
          </div>
          
          <button onclick={goBack} class="w-full btn">Cancel</button>
        </div>
      {/if}
    </div>
  </div>
</div>
{/if} 
<script lang="ts">
  import MultiplayerHandler from './MultiplayerHandler.svelte';
  import type { ConnectionStatus } from '../types/multiplayer';

  // Props
  interface Props {
    onGameStart?: (gameState: any) => void;
    onError?: (error: string) => void;
  }

  let { onGameStart, onError }: Props = $props();

  // Component references
  let multiplayerHandler: MultiplayerHandler;

  // UI state
  let currentView: 'menu' | 'create' | 'join' | 'waiting' | 'error' = $state('menu');
  let playerName = $state('');
  let roomCodeInput = $state('');
  let connectionStatus: ConnectionStatus = $state('disconnected');
  let errorMessage = $state('');
  let createdRoomCode = $state('');
  let isCreatingRoom = $state(false);
  let isJoiningRoom = $state(false);

  // Handle connection status changes
  function handleConnectionStatusChange(status: ConnectionStatus) {
    connectionStatus = status;
    
    if (status === 'connected' && currentView === 'waiting') {
      const state = multiplayerHandler?.getCurrentState();
      if (state?.gameState) {
        onGameStart?.(state.gameState);
      }
    }
  }

  // Handle game state updates
  function handleGameStateUpdate(gameState: any) {
    onGameStart?.(gameState);
  }

  // Handle errors
  function handleError(error: string) {
    errorMessage = error;
    currentView = 'error';
    onError?.(error);
  }

  // Create a new room
  async function createRoom() {
    if (!playerName.trim()) {
      errorMessage = 'Please enter your name';
      return;
    }

    isCreatingRoom = true;
    errorMessage = '';

    try {
      const result = await multiplayerHandler.createRoom(playerName.trim());
      
      if (result) {
        createdRoomCode = result.roomCode;
        currentView = 'waiting';
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      isCreatingRoom = false;
    }
  }

  // Join an existing room
  async function joinRoom() {
    if (!playerName.trim()) {
      errorMessage = 'Please enter your name';
      return;
    }

    if (!roomCodeInput.trim()) {
      errorMessage = 'Please enter room code';
      return;
    }

    isJoiningRoom = true;
    errorMessage = '';

    try {
      const success = await multiplayerHandler.joinRoom(
        roomCodeInput.trim().toUpperCase(), 
        playerName.trim()
      );
      
      if (success) {
        currentView = 'waiting';
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      isJoiningRoom = false;
    }
  }

  // Go back to main menu
  function goBack() {
    currentView = 'menu';
    errorMessage = '';
    multiplayerHandler?.disconnect();
  }

  // Copy room code to clipboard
  async function copyRoomCode() {
    try {
      await navigator.clipboard.writeText(createdRoomCode);
    } catch (error) {
      console.error('Failed to copy room code:', error);
    }
  }

  function formatRoomCode(code: string): string {
    return code.replace(/-/g, ' - ');
  }

  function getConnectionStatusText(status: ConnectionStatus): string {
    switch (status) {
      case 'connecting': return 'Connecting...';
      case 'connected': return 'Connected';
      case 'reconnecting': return 'Reconnecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  }

  function getConnectionStatusClass(status: ConnectionStatus): string {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting':
      case 'reconnecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
</script>

<MultiplayerHandler 
  bind:this={multiplayerHandler}
  gameMode="REFORGED"
  onGameStateUpdate={handleGameStateUpdate}
  onConnectionStatusChange={handleConnectionStatusChange}
  onError={handleError}
/>

<div class="max-w-md mx-auto">
  {#if currentView === 'menu'}
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Multiplayer Bagchal</h2>
      <p class="text-gray-600 text-center mb-6">
        Play Bagchal Reforged with a friend online
      </p>

      <div class="mb-6">
        <label for="playerName" class="block text-sm font-medium mb-2">Your Name</label>
        <input 
          id="playerName"
          type="text" 
          bind:value={playerName}
          placeholder="Enter your name"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxlength="20"
        />
      </div>

      <div class="space-y-3">
        <button 
          onclick={createRoom}
          disabled={!playerName.trim() || isCreatingRoom}
          class="w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingRoom ? 'Creating Room...' : 'Create New Room'}
        </button>

        <button 
          onclick={() => currentView = 'join'}
          disabled={!playerName.trim()}
          class="w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Join Existing Room
        </button>
      </div>

      {#if errorMessage}
        <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-800 text-sm">{errorMessage}</p>
        </div>
      {/if}
    </div>

  {:else if currentView === 'join'}
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div class="flex items-center mb-6">
        <button onclick={goBack} class="px-2 py-1 text-sm rounded-md font-medium transition-colors duration-200 bg-gray-100 text-gray-900 hover:bg-gray-200 mr-3">← Back</button>
        <h2 class="text-xl font-bold text-gray-900">Join Room</h2>
      </div>

      <div class="mb-6">
        <label for="roomCode" class="block text-sm font-medium mb-2">Room Code</label>
        <input 
          id="roomCode"
          type="text" 
          bind:value={roomCodeInput}
          placeholder="BRAVE-TIGER-123"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center uppercase"
          maxlength="20"
        />
        <p class="text-xs text-gray-600 mt-1">
          Enter the room code shared by your opponent
        </p>
      </div>

      <button 
        onclick={joinRoom}
        disabled={!roomCodeInput.trim() || isJoiningRoom}
        class="w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isJoiningRoom ? 'Joining Room...' : 'Join Room'}
      </button>

      {#if errorMessage}
        <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-800 text-sm">{errorMessage}</p>
        </div>
      {/if}
    </div>

  {:else if currentView === 'waiting'}
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">Room Created</h2>

      {#if createdRoomCode}
        <div class="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-600 mb-2 text-center">Share this room code:</p>
          <div class="flex items-center justify-center gap-2">
            <span class="font-mono text-2xl font-bold text-center tracking-wider">
              {formatRoomCode(createdRoomCode)}
            </span>
            <button 
              onclick={copyRoomCode}
              class="px-2 py-1 text-sm rounded-md font-medium transition-colors duration-200 bg-gray-100 text-gray-900 hover:bg-gray-200"
              title="Copy room code"
            >
              📋
            </button>
          </div>
        </div>
      {/if}

      <div class="text-center mb-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
          <div class="w-2 h-2 rounded-full {connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}"></div>
          <span class="text-sm {getConnectionStatusClass(connectionStatus)}">
            {getConnectionStatusText(connectionStatus)}
          </span>
        </div>
      </div>

      <div class="text-center text-gray-600 mb-6">
        <p class="mb-2">Waiting for opponent to join...</p>
        <div class="animate-bounce text-2xl">⏳</div>
      </div>

      <button onclick={goBack} class="w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 bg-gray-100 text-gray-900 hover:bg-gray-200">
        Cancel Game
      </button>
    </div>

  {:else if currentView === 'error'}
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-bold text-red-600 mb-4 text-center">Connection Error</h2>
      
      <div class="text-center mb-6">
        <div class="text-6xl mb-4">❌</div>
        <p class="text-gray-600">{errorMessage}</p>
      </div>

      <button onclick={goBack} class="w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-700">
        Try Again
      </button>
    </div>
  {/if}
</div>

<style>
  .multiplayer-room-ui {
    min-height: 400px;
  }
</style> 
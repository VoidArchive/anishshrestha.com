<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount as onMountInstance } from 'svelte';
  
  // Import existing Bagchal components
  import GameBoard from '$games/bagchal/ui/GameBoard.svelte';
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
  
  // Import multiplayer components
  import MultiplayerRoomUI from '$games/bagchal/ui/MultiplayerRoomUI.svelte';
  import { WebSocketClient, type MultiplayerGameState } from '$core/multiplayer';

  // Import game logic
  import { points, lines } from '$games/bagchal/store.svelte';

  // Game state - simplified to only handle multiplayer
  let gameState: MultiplayerGameState | null = $state(null);
  let isInGame = $state(false);
  let errorMessage = $state('');
  let wsClient: WebSocketClient | null = $state(null);
  // Local UI-only selection state so we never mutate the gameState directly
  let selectedPieceId: number | null = null;

  // Player info from multiplayer
  let currentPlayerId: string | null = $state(null);
  let playerRole: 'GOAT' | 'TIGER' | null = $state(null);
  let playerName: string = $derived(gameState && currentPlayerId ? (gameState as MultiplayerGameState).players[currentPlayerId]?.name ?? '' : '');
  let opponentName: string = $derived(gameState && currentPlayerId ? (() => {
    const opp = Object.values((gameState as MultiplayerGameState).players).find((p: any) => p.id !== currentPlayerId);
    return opp?.name ?? 'Waiting...';
  })() : '');
  let currentTurnName: string = $derived(gameState ? (gameState as MultiplayerGameState).players[(gameState as MultiplayerGameState).currentPlayerId]?.name ?? '' : '');
  let isMyTurn = $derived(
    gameState && currentPlayerId && (gameState as MultiplayerGameState).currentPlayerId === currentPlayerId
  );

  // Handle successful game start
  function handleGameStart(state: MultiplayerGameState, client: WebSocketClient) {
    gameState = state;
    wsClient = client;
    isInGame = true;
    
    // Extract player info from the WebSocket client itself to correctly map role
    currentPlayerId = client.getPlayerId();
    if (!currentPlayerId) {
      console.warn('Unable to determine local playerId from WebSocket client');
    }

    if (currentPlayerId && state.players[currentPlayerId]) {
      playerRole = state.players[currentPlayerId].role;
    } else {
      // Fallback to original logic if for some reason the ID is not found
      // (should not happen, but prevents UI breakage)
      playerRole = state.players[state.hostPlayerId]?.role || 'GOAT';
    }
    errorMessage = '';
  }

  // Handle multiplayer errors
  function handleMultiplayerError(error: string) {
    errorMessage = error;
    console.error('Multiplayer error:', error);
  }

  // Handle point clicks (moves) - simplified for multiplayer
  function handlePointClick(pointId: number) {
    if (!gameState || !isMyTurn) {
      return;
    }

    // Use component-scoped selectedPieceId to keep track of which piece the
    // player has clicked to move. This never touches the trusted gameState
    // coming from the server.
    let moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE' = 'PLACEMENT';
    let fromId: number | null = null;
    let jumpedGoatId: number | null = null;

    if (gameState.phase === 'PLACEMENT' && gameState.turn === 'GOAT') {
      if (gameState.board[pointId] !== null) {
        return; // Can't place on occupied position
      }
      moveType = 'PLACEMENT';
    } else {
      // Movement phase
      if (selectedPieceId !== null) {
        fromId = selectedPieceId;
        moveType = 'MOVEMENT';
        selectedPieceId = null;
      } else {
        // Selecting a piece
        if (gameState.board[pointId] === gameState.turn) {
          selectedPieceId = pointId;
          return;
        }
      }
    }

    // Send move to WebSocket server
    if (wsClient) {
      wsClient.sendMove({
        from: fromId,
        to: pointId,
        jumpedGoatId,
        moveType
      });
    }
  }

  // Leave game and return to classic mode
  function leaveGame() {
    isInGame = false;
    gameState = null;
    currentPlayerId = null;
    playerRole = null;

    // Gracefully close the WebSocket connection so that the server can clean
    // up session state immediately.
    if (wsClient) {
      wsClient.disconnect();
      wsClient = null;
    }
    goto('/games/bagchal');
  }

  // Get valid moves (simplified for now)
  function getValidMoves(): number[] {
    if (!gameState || !isMyTurn) return [];
    return []; // TODO: Implement proper move validation
  }

  // Provide wsClient getter to module-level lifecycle handlers
  onMountInstance(() => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    __setWsClientGetter(() => wsClient);
  });
</script>

<svelte:head>
  <title>Bagchal Reforged – Multiplayer | anishshrestha.com</title>
</svelte:head>

<ErrorBoundary fallback="The multiplayer game encountered an error. Please refresh the page.">
  <section class="container py-8 lg:py-12">
    
    {#if !isInGame}
      <!-- Room Selection UI -->
      <div class="max-w-2xl mx-auto text-center mb-8">
        <h1 class="text-3xl font-bold mb-4 text-text">Bagchal Reforged</h1>
        <p class="text-text-muted mb-8">
          The multiplayer version of the traditional Nepali strategy game.
          Play online with friends in real-time.
        </p>
        
        <div class="mb-6">
          <a href="/games/bagchal" class="btn">← Back to Classic Mode</a>
        </div>
      </div>

      <!-- Multiplayer Room UI -->
      <MultiplayerRoomUI 
        onGameStart={handleGameStart}
        onError={handleMultiplayerError}
      />

      {#if errorMessage}
        <div class="max-w-md mx-auto mt-6">
          <div class="bg-bg-secondary border border-primary p-4">
            <p class="text-primary text-sm">{errorMessage}</p>
          </div>
        </div>
      {/if}

    {:else if gameState}
      <!-- Active Multiplayer Game -->
      <div class="mb-4 text-center">
        <h1 class="text-2xl font-bold mb-2 text-text">Bagchal Reforged</h1>
        <div class="flex items-center justify-center gap-4 text-sm text-text-muted">
          <span>Room: <span class="font-mono text-primary">{gameState.roomCode}</span></span>
          <span>•</span>
          <span>You: <span class="text-text">{playerName}</span> ({playerRole})</span>
          <span>•</span>
          <span>Opponent: <span class="text-text">{opponentName}</span></span>
          <span>•</span>
          <span class={isMyTurn ? 'text-primary font-medium' : ''}>
            {isMyTurn ? 'Your Turn' : `${currentTurnName}'s Turn`}
          </span>
        </div>
      </div>

      <div class="flex flex-col items-center gap-4">
        <GameBoard
          {points}
          {lines}
          gameState={gameState}
          validMoves={getValidMoves()}
          handlePointClick={handlePointClick}
          isComputerThinking={false}
          isPlayingComputer={false}
          playerSide={playerRole || 'GOAT'}
          moveHistory={[]}
        />
      </div>

      <!-- Multiplayer-specific controls -->
      <div class="mt-6 text-center">
        <button onclick={leaveGame} class="btn border-primary text-primary hover:bg-primary hover:text-bg-primary">
          Leave Game
        </button>
      </div>
    {/if}
  </section>
</ErrorBoundary>

<!-- Lifecycle hooks – ensure we *always* close the socket when the user leaves
     the page (navigation, tab close, etc.) to prevent zombie sessions in the
     Durable Object. -->
<script lang="ts" context="module">
  import { onDestroy, onMount } from 'svelte';
  import type { WebSocketClient as MultiplayerWebSocketClient } from '$core/multiplayer';

  // Getter that the instance script will register so that the module context
  // can access the current `wsClient` value without a direct import cycle.
  let _getWsClient: () => MultiplayerWebSocketClient | null = () => null;

  export function __setWsClientGetter(fn: () => MultiplayerWebSocketClient | null) {
    _getWsClient = fn;
  }

  onMount(() => {
    const beforeUnload = () => {
      _getWsClient()?.disconnect();
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  });

  onDestroy(() => {
    _getWsClient()?.disconnect();
  });
</script>
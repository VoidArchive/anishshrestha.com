<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount as onMountInstance, onDestroy } from 'svelte';
  
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

    // Also register beforeunload handler directly here (runs only in browser)
    const beforeUnload = () => {
      wsClient?.disconnect();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', beforeUnload);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', beforeUnload);
      }
    };
  });

  // Ensure that we close the socket when the component is destroyed (i.e., route changes)
  onDestroy(() => {
    wsClient?.disconnect();
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
     
      <!-- Use the same layout structure as classic for consistent board sizing -->
      <div class="flex flex-col gap-4 lg:grid lg:h-full lg:grid-cols-[350px_1fr] lg:gap-8">
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
        
        <!-- Status sidebar - moved to right to match classic layout -->
        <aside class="space-y-4">
          <div class="section-card">
            <h2 class="section-title mb-2">Game Status</h2>
            <ul class="text-sm leading-6 space-y-1">
              <li class="flex justify-between"><span>Room</span><span class="font-mono text-primary">{gameState.roomCode}</span></li>
              <li class="flex justify-between"><span>You</span><span>{playerName} ({playerRole})</span></li>
              <li class="flex justify-between"><span>Opponent</span><span>{opponentName}</span></li>
              <li class={`flex justify-between ${isMyTurn ? 'text-primary font-semibold' : ''}`}>
                <span>Turn</span><span>{isMyTurn ? 'Your turn' : `${currentTurnName}'s turn`}</span>
              </li>
            </ul>
            <button onclick={leaveGame} class="btn w-full mt-4 border-primary text-primary hover:bg-primary hover:text-bg-primary">
              Leave Game
            </button>
          </div>
        </aside>
      </div>
    {/if}
  </section>
</ErrorBoundary>

<script lang="ts" module>
  import type { WebSocketClient as MultiplayerWebSocketClient } from '$core/multiplayer';

  // Getter that the instance script will register so that the module context
  // can access the current `wsClient` value without creating a circular import.
  let _getWsClient: () => MultiplayerWebSocketClient | null = () => null;

  export function __setWsClientGetter(fn: () => MultiplayerWebSocketClient | null) {
    _getWsClient = fn;
  }

  /**
   * SvelteKit navigation lifecycle – runs on client-side page transitions.
   * The `beforeNavigate` hook lets us disconnect the socket when the user
   * navigates away, preventing zombie sessions.
   */
  export function beforeNavigate() {
    _getWsClient()?.disconnect();
  }
</script>
<script lang="ts">
  import { goto } from '$app/navigation';
  
  // Import existing Bagchal components
  import GameBoard from '$games/bagchal/ui/GameBoard.svelte';
  import GameSidebar from '$games/bagchal/ui/GameSidebar.svelte';
  import WinnerModal from '$games/bagchal/ui/WinnerModal.svelte';
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
  
  // Import new multiplayer components
  import MultiplayerRoomUI from '$games/bagchal/ui/MultiplayerRoomUI.svelte';
  import MultiplayerHandler from '$games/bagchal/ui/MultiplayerHandler.svelte';
  
  // Import game logic
  import { points, lines } from '$games/bagchal/store.svelte';
  import type { MultiplayerGameState } from '$games/bagchal/types/multiplayer';

  // Game state
  let gameState: MultiplayerGameState | null = $state(null);
  let isInGame = $state(false);
  let multiplayerHandler: MultiplayerHandler;
  let errorMessage = $state('');

  // Player info from multiplayer
  let currentPlayerId: string | null = $state(null);
  let playerRole: 'GOAT' | 'TIGER' | null = $state(null);
  let isMyTurn = $derived(
    gameState && currentPlayerId && (gameState as MultiplayerGameState).currentPlayerId === currentPlayerId
  );

  // Handle successful game start
  function handleGameStart(state: MultiplayerGameState) {
    gameState = state;
    isInGame = true;
    
    // Get player info from multiplayer handler
    const mpState = multiplayerHandler?.getCurrentState();
    if (mpState) {
      currentPlayerId = mpState.playerId;
      playerRole = mpState.playerRole;
    }
  }

  // Handle game state updates during play
  function handleGameStateUpdate(state: MultiplayerGameState) {
    gameState = state;
  }

  // Handle multiplayer errors
  function handleMultiplayerError(error: string) {
    errorMessage = error;
    console.error('Multiplayer error:', error);
  }

  // Handle point clicks (moves)
  function handlePointClick(pointId: number) {
    if (!gameState || !isMyTurn) {
      return;
    }

    // Determine move type based on game state
    let moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE' = 'PLACEMENT';
    let fromId: number | null = null;
    let jumpedGoatId: number | null = null;

    if (gameState.phase === 'PLACEMENT' && gameState.turn === 'GOAT') {
      // Goat placement
      if (gameState.board[pointId] !== null) {
        return; // Can't place on occupied position
      }
      moveType = 'PLACEMENT';
    } else {
      // Movement phase - need to implement move logic
      // For now, simple move detection
      if (gameState.selectedPieceId !== null) {
        fromId = gameState.selectedPieceId;
        moveType = 'MOVEMENT'; // Could be CAPTURE if jumping over goat
      } else {
        // Selecting a piece
        if (gameState.board[pointId] === gameState.turn) {
          gameState.selectedPieceId = pointId;
          return;
        }
      }
    }

    // Send move to multiplayer handler
    multiplayerHandler?.sendMove({
      from: fromId,
      to: pointId,
      jumpedGoatId,
      moveType
    });

    // Clear selection
    if (gameState) {
      gameState.selectedPieceId = null;
    }
  }

  // Leave game and return to room selection
  function leaveGame() {
    multiplayerHandler?.disconnect();
    isInGame = false;
    gameState = null;
    currentPlayerId = null;
    playerRole = null;
    goto('/games/bagchal');
  }

  // Get valid moves (simplified for now)
  function getValidMoves(): number[] {
    if (!gameState || !isMyTurn) return [];
    
    // Return empty for now - would need to implement proper move validation
    return [];
  }

  // Check if it's the current player's turn
  function isPlayerTurn(): boolean {
    return isMyTurn || false;
  }

  // Get player name for sidebar
  function getPlayerName(role: 'GOAT' | 'TIGER'): string {
    if (!gameState) return 'Unknown';
    
    for (const player of Object.values(gameState.players)) {
      if (player.role === role) {
        return player.name;
      }
    }
    
    return role;
  }

  // Mock functions for compatibility with existing components
  function mockReset() {
    // Reset handled by multiplayer - just show message
    console.log('Reset not available in multiplayer');
  }

  function mockUndo() {
    // Undo not available in multiplayer
    console.log('Undo not available in multiplayer');
  }

  function mockGameModeChange() {
    // Mode change handled by room selection
  }

  function mockPlayerSideChange() {
    // Player side determined by room
  }

  function mockModeChange() {
    // Mode is always Reforged in multiplayer
  }
</script>

<svelte:head>
  <title>Bagchal Reforged – Multiplayer | anishshrestha.com</title>
</svelte:head>

<ErrorBoundary fallback="The multiplayer game encountered an error. Please refresh the page.">
  <section class="container py-8 lg:py-12">
    
    {#if !isInGame}
      <!-- Room Selection UI -->
      <div class="max-w-2xl mx-auto text-center mb-8">
        <h1 class="text-3xl font-bold mb-4">Bagchal Reforged</h1>
        <p class="text-text-muted mb-8">
          The multiplayer version of the traditional Nepali strategy game.
          Play online with friends in real-time.
        </p>
        
        <div class="mb-6">
          <a href="/games/bagchal" class="px-4 py-2 rounded-md font-medium transition-colors duration-200 bg-gray-100 text-gray-900 hover:bg-gray-200">← Back to Classic Mode</a>
        </div>
      </div>

      <!-- Multiplayer Room UI -->
      <MultiplayerRoomUI 
        onGameStart={handleGameStart}
        onError={handleMultiplayerError}
      />

      <!-- Hidden multiplayer handler -->
      <MultiplayerHandler 
        bind:this={multiplayerHandler}
        gameMode="REFORGED"
        onGameStateUpdate={handleGameStateUpdate}
        onError={handleMultiplayerError}
      />

      {#if errorMessage}
        <div class="max-w-md mx-auto mt-6">
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <p class="text-red-800 text-sm">{errorMessage}</p>
          </div>
        </div>
      {/if}

    {:else if gameState}
      <!-- Active Multiplayer Game -->
      <div class="mb-4 text-center">
        <h1 class="text-2xl font-bold mb-2">Bagchal Reforged</h1>
        <div class="flex items-center justify-center gap-4 text-sm text-text-muted">
          <span>Room: {gameState.roomCode}</span>
          <span>•</span>
          <span>You are: {playerRole}</span>
          <span>•</span>
          <span class={isMyTurn ? 'text-green-600 font-medium' : ''}>
            {isMyTurn ? 'Your Turn' : `${gameState.turn}'s Turn`}
          </span>
        </div>
      </div>

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
        
        <GameSidebar
          gameState={gameState}
          isPlayingComputer={false}
          playerSide={playerRole || 'GOAT'}
          gameMode="REFORGED"
          isComputerThinking={false}
          canUndo={false}
          onReset={mockReset}
          onGameModeChange={mockGameModeChange}
          onPlayerSideChange={mockPlayerSideChange}
          onModeChange={mockModeChange}
          onUndo={mockUndo}
        />
      </div>

      <!-- Multiplayer-specific controls -->
      <div class="mt-6 text-center">
        <button onclick={leaveGame} class="px-4 py-2 rounded-md font-medium transition-colors duration-200 bg-red-100 text-red-700 hover:bg-red-200">
          Leave Game
        </button>
      </div>

      <!-- Winner Modal -->
      {#if gameState.winner}
        <WinnerModal
          gameState={gameState}
          moveHistory={[]}
          isPlayingComputer={false}
          playerSide={playerRole || 'GOAT'}
          onPlayAgain={mockReset}
          onSwitchSides={mockPlayerSideChange}
          onChangeMode={mockModeChange}
        />
      {/if}
    {/if}
  </section>
</ErrorBoundary>

 
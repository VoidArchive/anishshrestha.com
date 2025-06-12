<script lang="ts">
	import type { GameState } from '$lib/bagchal';
	import GameStatus from './GameStatus.svelte';
	import GameControls from './GameControls.svelte';
	import GameSettings from './GameSettings.svelte';
	import GameRules from './GameRules.svelte';
	import MoveHistory from './MoveHistory.svelte';

	interface Props {
		gameState: GameState;
		moveHistory: string[];
		isPlayingComputer: boolean;
		playerSide: string;
		onReset: () => void;
		onGameModeChange: (isComputer: boolean) => void;
		onPlayerSideChange: (side: string) => void;
		onUndo: () => void;
		canUndo: boolean;
	}

	let { 
		gameState, 
		moveHistory, 
		isPlayingComputer,
		playerSide,
		onReset, 
		onGameModeChange,
		onPlayerSideChange,
		onUndo,
		canUndo
	}: Props = $props();
</script>

<aside class="space-y-6 lg:order-1">
	<GameStatus {gameState} />
	<GameControls {onReset} {onUndo} {canUndo} />
	<GameSettings {isPlayingComputer} {playerSide} {onGameModeChange} {onPlayerSideChange} {onReset} />
	<GameRules />
	<MoveHistory {moveHistory} />
</aside> 
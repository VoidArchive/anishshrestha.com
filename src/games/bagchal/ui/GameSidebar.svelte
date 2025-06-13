<script lang="ts">
	import type { GameState } from '$games/bagchal/rules';
	import GameStatus from './GameStatus.svelte';
	import GameControls from './GameControls.svelte';
	import GameSettings from './GameSettings.svelte';
	import GameRules from './GameRules.svelte';

	interface Props {
		gameState: GameState;
		isPlayingComputer: boolean;
		playerSide: string;
		gameMode: 'CLASSIC' | 'REFORGED';
		isComputerThinking: boolean;
		onReset: () => void;
		onGameModeChange: (isComputer: boolean) => void;
		onPlayerSideChange: (side: string) => void;
		onModeChange: (mode: 'CLASSIC' | 'REFORGED') => void;
		onUndo: () => void;
		canUndo: boolean;
	}

	let {
		gameState,
		isPlayingComputer,
		playerSide,
		gameMode,
		isComputerThinking,
		onReset,
		onGameModeChange,
		onPlayerSideChange,
		onModeChange,
		onUndo,
		canUndo
	}: Props = $props();
</script>

<aside class="space-y-4 lg:order-1 lg:space-y-6">
	<GameStatus {gameState} {isComputerThinking} {isPlayingComputer} {playerSide} />
	<GameSettings
		{isPlayingComputer}
		{playerSide}
		{gameMode}
		{onGameModeChange}
		{onPlayerSideChange}
		{onModeChange}
		{onReset}
	/>
	<GameControls {onReset} {onUndo} {canUndo} />
	<GameRules />
</aside>

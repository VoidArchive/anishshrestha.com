<script lang="ts">
	import {
		gameState,
		adjacency,
		points,
		getValidMoves,
		getCurrentTigerCaptures
	} from '$games/bagchal/store.svelte';
	import {
		executeMove,
		checkIfTigersAreTrapped
	} from '$games/bagchal/rules';

	interface Props {
		moveHistory: string[];
		onSaveGameState: () => void;
		onAddToHistory: (message: string) => void;
		onTriggerAnimation?: (from: number | null, to: number, moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE', jumpedGoatId?: number) => void;
	}

	let { moveHistory, onSaveGameState, onAddToHistory, onTriggerAnimation }: Props = $props();

	// Local derived state
	let validMoves = $derived(getValidMoves());
	let currentTigerCaptures = $derived(getCurrentTigerCaptures());

	// Handle board position clicks
	export function handlePointClick(id: number) {
		if (gameState.winner) return;

		const pieceAtClickId = gameState.board[id];
		const currentlySelectedId = gameState.selectedPieceId;

		if (gameState.turn === 'GOAT') {
			if (gameState.phase === 'PLACEMENT') {
				if (pieceAtClickId === null) {
					// Trigger placement animation
					onTriggerAnimation?.(null, id, 'PLACEMENT');
					
					onSaveGameState();
					gameState.board[id] = 'GOAT';
					gameState.goatsPlaced++;
					onAddToHistory(`Goat placed at position ${id}`);

					if (checkIfTigersAreTrapped(gameState, adjacency, points)) {
						gameState.winner = 'GOAT';
						onAddToHistory('Goats win by trapping tigers!');
					}

					if (!gameState.winner && gameState.goatsPlaced >= 20) {
						gameState.phase = 'MOVEMENT';
					}

					if (!gameState.winner) {
						gameState.turn = 'TIGER';
					}
				}
			} else {
				if (pieceAtClickId === 'GOAT') {
					gameState.selectedPieceId = id;
				} else if (
					pieceAtClickId === null &&
					currentlySelectedId !== null &&
					validMoves.includes(id)
				) {
					// Trigger movement animation
					onTriggerAnimation?.(currentlySelectedId, id, 'MOVEMENT');
					
					onSaveGameState();
					executeMove(gameState, currentlySelectedId, id, null, adjacency, points);
					onAddToHistory(`Goat moved from ${currentlySelectedId} to ${id}`);
				} else {
					gameState.selectedPieceId = null;
				}
			}
		}

		if (gameState.turn === 'TIGER') {
			if (pieceAtClickId === 'TIGER') {
				// Direct selection - no setTimeout needed with proper reactivity
				gameState.selectedPieceId = gameState.selectedPieceId === id ? null : id;
			} else if (
				pieceAtClickId === null &&
				currentlySelectedId !== null &&
				validMoves.includes(id)
			) {
				const captureInfo = currentTigerCaptures.find((c) => c.destinationId === id);
				const jumpedGoatId = captureInfo ? captureInfo.jumpedGoatId : null;

				// Trigger animation (capture or movement)
				const moveType = jumpedGoatId ? 'CAPTURE' : 'MOVEMENT';
				onTriggerAnimation?.(currentlySelectedId, id, moveType, jumpedGoatId || undefined);
				
				onSaveGameState();

				if (jumpedGoatId) {
					onAddToHistory(`Tiger captured goat at ${jumpedGoatId} and moved to ${id}`);
				} else {
					onAddToHistory(`Tiger moved from ${currentlySelectedId} to ${id}`);
				}

				executeMove(gameState, currentlySelectedId, id, jumpedGoatId, adjacency, points);
			} else {
				// Clear selection when clicking elsewhere
				gameState.selectedPieceId = null;
			}
		}
	}
</script> 
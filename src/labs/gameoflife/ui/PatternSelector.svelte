<!--
Conway's Game of Life - Pattern Selector Component

Allows users to browse and select from predefined patterns like gliders,
oscillators, still lifes, and complex patterns. Provides preview and insertion functionality.
-->

<script lang="ts">
	import { PATTERNS_BY_CATEGORY, getPatternByName } from '../engine/patterns';
	import { PatternCategory } from '../rules/types';
	import { simulationState, insertPatternAt } from '../store.svelte.js';

	let selectedCategory = $state<PatternCategory>(PatternCategory.OSCILLATORS);
	let selectedPatternName = $state<string | null>(null);

	let currentPatterns = $derived(PATTERNS_BY_CATEGORY[selectedCategory] || []);

	let selectedPattern = $derived(
		selectedPatternName ? getPatternByName(selectedPatternName) : null
	);

	/**
	 * Inserts the selected pattern at grid center
	 */
	function insertPattern(): void {
		if (!selectedPattern) return;

		const centerX = Math.floor(simulationState.gridSize.width / 2 - selectedPattern.width / 2);
		const centerY = Math.floor(simulationState.gridSize.height / 2 - selectedPattern.height / 2);

		insertPatternAt(selectedPattern.name, Math.max(0, centerX), Math.max(0, centerY));

		selectedPatternName = null;
	}

	function getCategoryName(category: PatternCategory): string {
		switch (category) {
			case PatternCategory.STILL_LIFES:
				return 'Still Lifes';
			case PatternCategory.OSCILLATORS:
				return 'Oscillators';
			case PatternCategory.SPACESHIPS:
				return 'Spaceships';
			case PatternCategory.RANDOM:
				return 'Complex';
			default:
				return category;
		}
	}
</script>

<div class="pattern-selector">
	<div class="category-tabs" role="tablist" aria-label="Pattern categories">
		{#each Object.values(PatternCategory) as category (category)}
			<button
				class="btn"
				class:active={selectedCategory === category}
				role="tab"
				aria-selected={selectedCategory === category}
				onclick={() => {
					selectedCategory = category;
					selectedPatternName = null;
				}}
			>
				{getCategoryName(category)}
			</button>
		{/each}
	</div>

	<div class="pattern-list">
		{#each currentPatterns as pattern (pattern.name)}
			<button
				class="pattern-item caps"
				class:selected={selectedPatternName === pattern.name}
				aria-pressed={selectedPatternName === pattern.name}
				onclick={() => (selectedPatternName = pattern.name)}
			>
				<span>{pattern.name}</span>
				<span class="pattern-size">{pattern.width}×{pattern.height}</span>
			</button>
		{/each}

		{#if currentPatterns.length === 0}
			<p class="note">No patterns in this category.</p>
		{/if}
	</div>

	{#if selectedPattern}
		<div class="pattern-info">
			<div class="info-header">
				<h3>{selectedPattern.name}</h3>
				<span class="caps pattern-size">{selectedPattern.width} × {selectedPattern.height}</span>
			</div>

			<p class="pattern-description">{selectedPattern.description}</p>

			<div
				class="preview-grid"
				style="
					--preview-width: {selectedPattern.width};
					--preview-height: {selectedPattern.height};
				"
				aria-hidden="true"
			>
				{#each selectedPattern.grid as row, y (y)}
					{#each row as cell, x (`${y}-${x}`)}
						<div class="preview-cell" class:alive={cell}></div>
					{/each}
				{/each}
			</div>

			<button class="btn" onclick={insertPattern} disabled={simulationState.isRunning}>
				Insert at Center
			</button>

			{#if simulationState.isRunning}
				<p class="note">Pause the simulation to insert a pattern.</p>
			{/if}
		</div>
	{:else}
		<p class="note">Select a pattern above to preview it and insert it into the grid.</p>
	{/if}
</div>

<style>
	.pattern-selector {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.category-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.pattern-list {
		display: flex;
		flex-direction: column;
		max-height: 200px;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--color-ink) var(--color-paper);
	}

	/* Rows on hairline rules, no boxes */
	.pattern-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
		padding: 7px 0;
		background: none;
		border: 0;
		border-top: 1px solid var(--color-ink);
		color: var(--color-ink);
		text-align: left;
		cursor: pointer;
	}

	.pattern-item:hover,
	.pattern-item.selected {
		color: var(--color-spot-text);
	}

	.pattern-item.selected::before {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		background: currentColor;
		margin-right: 6px;
		flex: none;
	}

	.pattern-item.selected > span:first-of-type {
		flex: 1;
	}

	.pattern-size {
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}

	.pattern-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		padding-top: 12px;
		border-top: 1px solid var(--color-ink);
	}

	.info-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
		width: 100%;
	}

	.info-header h3 {
		margin: 0;
		font-family: var(--font-family-display);
		font-size: 17px;
		font-weight: 600;
		line-height: 1.2;
	}

	.pattern-description {
		margin: 0;
		font-size: 15.5px;
		text-wrap: pretty;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(var(--preview-width), 10px);
		grid-template-rows: repeat(var(--preview-height), 10px);
		gap: 1px;
		padding: 1px;
		background: var(--color-tint);
		max-width: 100%;
		overflow: auto;
	}

	.preview-cell {
		background: var(--color-paper);
	}

	.preview-cell.alive {
		background: var(--color-ink);
	}

	.note {
		margin: 0;
		font-size: 15.5px;
		font-style: italic;
	}
</style>

<!--
Conway's Game of Life - Pattern Selector Component

Allows users to browse and select from predefined patterns like gliders,
oscillators, still lifes, and complex patterns. Provides preview and insertion functionality.
-->

<script lang="ts">
	import { Shapes, MousePointer, Info } from 'lucide-svelte';
	import {
		PATTERNS_BY_CATEGORY,
		getPatternByName
		// insertPattern as insertPatternAtPosition // Unused import removed
	} from '../engine/patterns';
	import { PatternCategory } from '../rules/types';
	import { simulationState, insertPatternAt } from '../store.svelte';

	let selectedCategory = $state<PatternCategory>(PatternCategory.OSCILLATORS);
	let selectedPatternName = $state<string | null>(null);
	let showPatternInfo = $state(false);

	/**
	 * Gets patterns for the selected category
	 */
	let currentPatterns = $derived(PATTERNS_BY_CATEGORY[selectedCategory] || []);

	/**
	 * Gets the currently selected pattern details
	 */
	let selectedPattern = $derived(
		selectedPatternName ? getPatternByName(selectedPatternName) : null
	);

	// Debug reactive variables
	$effect(() => {
		console.log('Reactive update - selectedPatternName:', selectedPatternName);
		console.log('Reactive update - showPatternInfo:', showPatternInfo);
		console.log('Reactive update - selectedPattern:', selectedPattern);
	});

	/**
	 * Handles pattern selection with debugging
	 */
	function selectPattern(patternName: string): void {
		try {
			console.log('selectPattern called with:', patternName);
			console.log('Before update - selectedPatternName:', selectedPatternName);
			console.log('Before update - showPatternInfo:', showPatternInfo);

			selectedPatternName = patternName;
			showPatternInfo = true;

			console.log('After update - selectedPatternName:', selectedPatternName);
			console.log('After update - showPatternInfo:', showPatternInfo);

			// Test pattern lookup
			const pattern = getPatternByName(patternName);
			console.log('Pattern lookup result:', pattern);
		} catch (error) {
			console.error('Error selecting pattern:', error);
		}
	}

	/**
	 * Handles pattern click with debugging
	 */
	function handlePatternClick(pattern: { name: string }): void {
		try {
			console.log('Pattern clicked:', pattern.name, pattern);
			selectPattern(pattern.name);
		} catch (error) {
			console.error('Error handling pattern click:', error);
		}
	}

	/**
	 * Handle click event with proper event handling
	 */
	function handleClickEvent(event: Event, pattern: { name: string }): void {
		event.preventDefault();
		event.stopPropagation();
		handlePatternClick(pattern);
	}

	/**
	 * Inserts the selected pattern at grid center
	 */
	function insertPattern(): void {
		if (!selectedPattern) return;

		const centerX = Math.floor(simulationState.gridSize.width / 2 - selectedPattern.width / 2);
		const centerY = Math.floor(simulationState.gridSize.height / 2 - selectedPattern.height / 2);

		insertPatternAt(selectedPattern.name, Math.max(0, centerX), Math.max(0, centerY));

		// Clear selection after insertion
		selectedPatternName = null;
		showPatternInfo = false;
	}

	/**
	 * Gets display name for category
	 */
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
	<!-- Category Tabs -->
	<div class="category-tabs">
		{#each Object.values(PatternCategory) as category (category)}
			<button
				class="category-tab {selectedCategory === category ? 'active' : ''}"
				onclick={() => {
					selectedCategory = category;
					selectedPatternName = null;
					showPatternInfo = false;
				}}
			>
				{getCategoryName(category)}
			</button>
		{/each}
	</div>

	<!-- Pattern List -->
	<div class="pattern-list">
		{#each currentPatterns as pattern (pattern.name)}
			<button
				class="pattern-item {selectedPatternName === pattern.name ? 'selected' : ''}"
				onclick={(event) => handleClickEvent(event, pattern)}
				style="outline: none;"
			>
				<div class="pattern-name">
					<Shapes size={14} />
					{pattern.name}
				</div>
				<div class="pattern-size">
					{pattern.width}×{pattern.height}
				</div>
			</button>
		{/each}

		{#if currentPatterns.length === 0}
			<div class="empty-category">
				<p class="empty-text">No patterns in this category</p>
				<p class="empty-text">
					Debug: Available categories: {Object.keys(PATTERNS_BY_CATEGORY).join(', ')}
				</p>
			</div>
		{/if}
	</div>

	<!-- Pattern Info & Insert -->
	{#if showPatternInfo && selectedPattern}
		<div class="pattern-info">
			<div class="info-header">
				<h4 class="pattern-title">
					<Info size={16} />
					{selectedPattern.name}
				</h4>
				<span class="pattern-dimensions">
					{selectedPattern.width} × {selectedPattern.height}
				</span>
			</div>

			<p class="pattern-description">
				{selectedPattern.description}
			</p>

			<!-- Pattern Preview Grid -->
			<div class="pattern-preview">
				<div
					class="preview-grid"
					style="
						--preview-width: {selectedPattern.width};
						--preview-height: {selectedPattern.height};
					"
				>
					{#each selectedPattern.grid as row, y (y)}
						{#each row as cell, x (`${y}-${x}`)}
							<div class="preview-cell {cell ? 'alive' : 'dead'}"></div>
						{/each}
					{/each}
				</div>
			</div>

			<button class="btn insert-btn" onclick={insertPattern} disabled={simulationState.isRunning}>
				<MousePointer size={16} />
				Insert at Center
			</button>

			{#if simulationState.isRunning}
				<p class="insert-note">Stop simulation to insert patterns</p>
			{/if}
		</div>
	{:else}
		<div class="pattern-help">
			<p class="help-text">Select a pattern above to preview and insert it into the grid.</p>
			<p class="help-text">
				Debug: Category = {selectedCategory}, Pattern count = {currentPatterns.length}
			</p>
		</div>
	{/if}
</div>

<style>
	.pattern-selector {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.category-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: var(--space-2);
	}

	.category-tab {
		padding: var(--space-1) var(--space-2);
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.3s ease;
		border-radius: 4px;
	}

	.category-tab:hover {
		border-color: var(--color-primary);
		color: var(--color-text);
	}

	.category-tab.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: white;
	}

	.pattern-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		max-height: 200px;
		overflow-y: auto;
	}

	.pattern-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		cursor: pointer;
		transition: all 0.3s ease;
		border-radius: 4px;
		/* Ensure buttons are clickable */
		pointer-events: auto;
		position: relative;
		z-index: 1;
	}

	.pattern-item:hover {
		border-color: var(--color-primary);
		background: rgba(201, 42, 42, 0.05);
	}

	.pattern-item.selected {
		border-color: var(--color-primary);
		background: rgba(201, 42, 42, 0.1);
	}

	.pattern-name {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.pattern-size {
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.empty-category {
		padding: var(--space-4);
		text-align: center;
	}

	.empty-text {
		color: var(--color-text-muted);
		font-style: italic;
		margin: 0;
	}

	.pattern-info {
		padding: var(--space-3);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.info-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.pattern-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.pattern-dimensions {
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		background: var(--color-bg-secondary);
		padding: var(--space-1);
		border-radius: 4px;
	}

	.pattern-description {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		line-height: 1.4;
	}

	.pattern-preview {
		display: flex;
		justify-content: center;
		padding: var(--space-2);
		background: var(--color-bg-secondary);
		border-radius: 4px;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(var(--preview-width), 1fr);
		grid-template-rows: repeat(var(--preview-height), 1fr);
		gap: 1px;
		background: var(--color-border);
	}

	.preview-cell {
		width: 8px;
		height: 8px;
		border-radius: 1px;
	}

	.preview-cell.alive {
		background: var(--color-primary);
	}

	.preview-cell.dead {
		background: var(--color-bg-secondary);
	}

	.insert-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.insert-btn:hover:not(:disabled) {
		background: #b91c1c;
		border-color: #b91c1c;
	}

	.insert-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.insert-note {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-align: center;
		margin: 0;
		font-style: italic;
	}

	.pattern-help {
		padding: var(--space-4);
		text-align: center;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
	}

	.help-text {
		margin: 0;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		line-height: 1.4;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.category-tabs {
			gap: var(--space-2);
		}

		.category-tab {
			flex: 1;
			text-align: center;
		}

		.pattern-item {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-1);
		}
	}
</style>

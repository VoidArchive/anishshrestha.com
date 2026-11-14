<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { browser } from '$app/env';
	import { SvelteSet } from 'svelte/reactivity';

	let birthDate = $state('2000-03-28');
	let livedWeeks = $state(0);

	const TOTAL_YEARS = 100;
	const WEEKS_PER_YEAR = 52;
	const TOTAL_WEEKS = TOTAL_YEARS * WEEKS_PER_YEAR;

	const weeksLeft = $derived(Math.max(0, TOTAL_WEEKS - livedWeeks));
	const percentLived = $derived(Math.min(100, (livedWeeks / TOTAL_WEEKS) * 100).toFixed(1));

	// The ripple is skipped on touch devices (cost) and under reduced motion (preference)
	let rippleOff = $state(false);

	$effect(() => {
		if (browser) {
			rippleOff =
				'ontouchstart' in window ||
				navigator.maxTouchPoints > 0 ||
				window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		}
	});

	// Calculate lived weeks when birthDate changes
	$effect(() => {
		if (!birthDate) return;
		const birth = new Date(birthDate);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - birth.getTime());
		const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
		livedWeeks = diffWeeks;
	});

	// Pre-compute grid data to avoid recalculation in template
	const years = Array.from({ length: TOTAL_YEARS }, (_, i) => i);
	const weeks = Array.from({ length: WEEKS_PER_YEAR }, (_, i) => i);

	function isLived(year: number, week: number) {
		return year * 52 + week < livedWeeks;
	}

	function isCurrent(year: number, week: number) {
		return year * 52 + week === livedWeeks;
	}

	// Ripple Animation Logic
	let svgRef: SVGSVGElement;
	let mousePos = { x: -100, y: -100 };
	let isHovering = false;
	let animationFrameId: number;

	$effect(() => () => cancelAnimationFrame(animationFrameId));
	let dirtyKeys = new SvelteSet<string>();

	function handleMouseMove(e: MouseEvent) {
		if (rippleOff || !svgRef) return;

		const rect = svgRef.getBoundingClientRect();
		const viewBoxWidth = 60;
		const viewBoxHeight = 110;
		const scaleX = viewBoxWidth / rect.width;
		const scaleY = viewBoxHeight / rect.height;

		const svgX = (e.clientX - rect.left) * scaleX - 4;
		const svgY = (e.clientY - rect.top) * scaleY - 6;

		mousePos = { x: svgX, y: svgY };
		isHovering = true;

		if (!animationFrameId) {
			animationFrameId = requestAnimationFrame(updateRipple);
		}
	}

	function handleMouseLeave() {
		if (rippleOff) return;
		isHovering = false;
		if (!animationFrameId) {
			animationFrameId = requestAnimationFrame(updateRipple);
		}
	}

	function updateRipple() {
		animationFrameId = 0;

		// Reset previous dirty cells
		for (const key of dirtyKeys) {
			const el = document.getElementById(key);
			if (el) {
				el.style.transform = '';
			}
		}
		dirtyKeys.clear();

		if (!isHovering) return;

		const RADIUS = 6;
		const startX = Math.floor(mousePos.x - RADIUS);
		const endX = Math.ceil(mousePos.x + RADIUS);
		const startY = Math.floor(mousePos.y - RADIUS);
		const endY = Math.ceil(mousePos.y + RADIUS);

		for (let y = startY; y <= endY; y++) {
			for (let w = startX; w <= endX; w++) {
				if (y < 0 || y >= TOTAL_YEARS || w < 0 || w >= WEEKS_PER_YEAR) continue;

				const dist = Math.hypot(w - mousePos.x, y - mousePos.y);

				if (dist < RADIUS) {
					const key = `cell-${y}-${w}`;
					const el = document.getElementById(key);
					if (el) {
						const intensity = Math.pow(1 - dist / RADIUS, 2);
						const scale = 1 + intensity * 0.2;
						el.style.transform = `scale(${scale})`;
						el.style.transformBox = 'fill-box';
						el.style.transformOrigin = 'center';
						dirtyKeys.add(key);
					}
				}
			}
		}
	}
</script>

<Seo
	title="Life Calendar | Anish Shrestha"
	description="Your life drawn in weeks: enter a birth date and see every week of a hundred years as one square, lived or still ahead."
/>

<main class="lab life-calendar container">
	<header>
		<div>
			<h1>Life Calendar</h1>
			<p class="dek">Your life in weeks: one square per week, a hundred years in rows.</p>
		</div>
		<div class="field">
			<label for="birthdate" class="caps">Birth date</label>
			<input type="date" id="birthdate" bind:value={birthDate} />
		</div>
		<!-- The browser's print dialog covers both: a printer, or "Save as PDF" -->
		<button type="button" class="print caps" onclick={() => window.print()}>
			Print / Save as PDF
		</button>
	</header>

	<figure class="plate">
		<svg
			bind:this={svgRef}
			viewBox="-4 -6 60 110"
			preserveAspectRatio="xMidYMin meet"
			class="touch-none select-none"
			role="img"
			aria-label="Life Calendar Grid"
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
		>
			<text x="0" y="-3.5" text-anchor="start" class="axis-title">Weeks →</text>

			{#each weeks as week (week)}
				{#if (week + 1) % 5 === 0 || week === 0}
					<text x={week + 0.4} y="-1.5" text-anchor="middle" class="label-text">
						{week + 1}
					</text>
				{/if}
			{/each}

			<text x="-3" y="0" text-anchor="end" transform="rotate(-90, -3, 0)" class="axis-title"
				>Years ←</text
			>

			{#each years as year (year)}
				{#if year % 5 === 0}
					<text x="-1" y={year + 0.6} text-anchor="end" class="label-text">
						{year}
					</text>
				{/if}
			{/each}

			<g>
				{#each years as year (year)}
					{#each weeks as week (week)}
						<rect
							id={`cell-${year}-${week}`}
							x={week}
							y={year}
							width="0.8"
							height="0.8"
							class="cell"
							class:lived={isLived(year, week)}
							class:current={isCurrent(year, week)}
							vector-effect="non-scaling-stroke"
						></rect>
					{/each}
				{/each}
			</g>
		</svg>

		<figcaption class="reading">
			<span class="k lived">Weeks lived {livedWeeks.toLocaleString()}</span>
			<span class="k left">Weeks left {weeksLeft.toLocaleString()}</span>
			<span>{percentLived}% lived</span>
		</figcaption>
	</figure>
</main>

<style>
	.lab {
		padding-top: 40px;
		padding-bottom: 72px;
		color: var(--color-ink);
	}

	header {
		margin-bottom: 40px;
	}
	h1 {
		font-family: var(--font-family-display);
		font-weight: 600;
		font-size: clamp(34px, 3vw, 40px);
		line-height: 1.02;
		letter-spacing: -0.015em;
		margin: 0 0 10px;
	}
	.dek {
		font-style: italic;
		font-size: 17px;
		margin: 0 0 24px;
		text-wrap: pretty;
	}

	.field {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
	}
	.field input {
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		padding: 7px 12px;
		border: 1px solid var(--color-ink);
		border-radius: 0;
	}
	.field input:focus-visible {
		outline: 2px solid var(--color-spot);
		outline-offset: 2px;
	}

	.print {
		margin-top: 16px;
		padding: 8px 14px;
		border: 1px solid var(--color-ink);
		background: var(--color-ink);
		color: var(--color-paper);
		cursor: pointer;
	}
	.print:hover {
		background: var(--color-spot);
		color: var(--color-on-spot);
		border-color: var(--color-spot);
	}
	.print:focus-visible {
		outline: 2px solid var(--color-spot);
		outline-offset: 2px;
	}

	.plate {
		margin: 0;
		max-width: 760px;
	}
	@media (min-width: 1024px) {
		.lab {
			display: grid;
			grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
			gap: 56px;
			align-items: start;
		}
		header {
			position: sticky;
			top: 24px;
			margin: 0;
		}
		.plate {
			max-width: 820px;
		}
	}
	.plate svg {
		display: block;
		width: 100%;
		border: 1.5px solid var(--color-ink);
		background: var(--color-paper);
		padding: 8px;
	}
	.label-text,
	.axis-title {
		font-family: var(--font-family-sans);
		fill: var(--color-ink);
		pointer-events: none;
	}
	.label-text {
		font-size: 0.6px;
	}
	.axis-title {
		font-size: 0.7px;
		font-weight: 700;
		letter-spacing: 0.05px;
		text-transform: uppercase;
	}
	.cell {
		fill: var(--color-paper);
		stroke: var(--color-tint);
		stroke-width: 1px;
	}
	.cell.lived {
		fill: var(--color-spot);
		stroke: none;
	}
	.cell.current {
		fill: var(--color-ink);
		stroke: none;
	}

	.reading {
		font-family: var(--font-family-sans);
		font-size: 11.5px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		line-height: 1.5;
		font-variant-numeric: tabular-nums;
		color: var(--color-spot-text);
		display: flex;
		flex-wrap: wrap;
		gap: 4px 18px;
		border-top: 1px solid var(--color-ink);
		padding-top: 8px;
		margin-top: 8px;
	}
	.k::before {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		margin-right: 6px;
		vertical-align: 1px;
		background: currentColor;
	}
	.k.left::before {
		background: var(--color-paper);
		border: 1px solid var(--color-spot);
	}

	/* One sheet: title, grid, reading. :has() keeps these rules off other pages after navigation. */
	@media print {
		@page {
			size: A4 portrait;
			margin: 10mm;
		}
		/* Always print the light edition, whatever the screen theme is */
		:global(:root:has(.life-calendar)) {
			--color-paper: #ffffff !important;
			--color-ink: #141414 !important;
			--color-spot: #ff6a13 !important;
			--color-tint: #ffe3d1 !important;
		}
		:global(body:has(.life-calendar) .running-head),
		:global(body:has(.life-calendar) .colophon-foot),
		.field,
		.print {
			display: none;
		}
		/* The grid is 60:110, so height is the limit: 133mm wide fills A4's 277mm of printable height */
		.lab {
			display: block;
			width: 133mm;
			max-width: none;
			margin: 0 auto;
			padding: 0;
			print-color-adjust: exact;
		}
		header {
			position: static;
			margin: 0 0 12px;
		}
		.dek {
			margin: 0;
		}
		.plate {
			max-width: none;
			break-inside: avoid;
		}
	}
</style>

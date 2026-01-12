<script lang="ts">
	import { fly } from 'svelte/transition';

	let birthDate = $state('2000-03-28');
	let livedWeeks = $state(0);

	const TOTAL_YEARS = 100;
	const WEEKS_PER_YEAR = 52;

	// Calculate lived weeks when birthDate changes
	$effect(() => {
		if (!birthDate) return;
		const birth = new Date(birthDate);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - birth.getTime());
		const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
		livedWeeks = diffWeeks;
	});

	// Grid generation for years and weeks
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

	// Store keys of currently affected cells to clean them up efficiently
	let dirtyKeys = new Set<string>();

	function handleMouseMove(e: MouseEvent) {
		if (!svgRef) return;

		// Get mouse position relative to SVG
		// grid is 52 x 100, plus margins (-4 to 56, -6 to 104) -> roughly 60x110 viewbox
		// We need to map client coordinates to SVG coordinates
		const rect = svgRef.getBoundingClientRect();
		const viewBoxWidth = 60; // 56 - (-4)
		const viewBoxHeight = 110; // 104 - (-6)
		const scaleX = viewBoxWidth / rect.width;
		const scaleY = viewBoxHeight / rect.height;

		// Calculate grid coordinates (relative to 0,0 origin of the grid rects)
		// Mouse X in SVG space
		const svgX = (e.clientX - rect.left) * scaleX - 4; // -4 is the viewBox min-x offset
		const svgY = (e.clientY - rect.top) * scaleY - 6; // -6 is the viewBox min-y offset

		mousePos = { x: svgX, y: svgY };
		isHovering = true;

		if (!animationFrameId) {
			animationFrameId = requestAnimationFrame(updateRipple);
		}
	}

	function handleMouseLeave() {
		isHovering = false;
		if (!animationFrameId) {
			animationFrameId = requestAnimationFrame(updateRipple);
		}
	}

	function updateRipple() {
		animationFrameId = 0;

		// 1. Reset previous dirty cells
		for (const key of dirtyKeys) {
			const el = document.getElementById(key);
			if (el) {
				el.style.transform = '';
				el.style.filter = '';
				// Keep z-index standard
				el.style.zIndex = '';
			}
		}
		dirtyKeys.clear();

		if (!isHovering) return;

		// 2. Calculate new affected cells
		// Radius of effect in grid units
		const RADIUS = 6;
		const startX = Math.floor(mousePos.x - RADIUS);
		const endX = Math.ceil(mousePos.x + RADIUS);
		const startY = Math.floor(mousePos.y - RADIUS);
		const endY = Math.ceil(mousePos.y + RADIUS);

		for (let y = startY; y <= endY; y++) {
			for (let w = startX; w <= endX; w++) {
				// Bounds check
				if (y < 0 || y >= TOTAL_YEARS || w < 0 || w >= WEEKS_PER_YEAR) continue;

				const dist = Math.hypot(w - mousePos.x, y - mousePos.y);

				if (dist < RADIUS) {
					const key = `cell-${y}-${w}`;
					const el = document.getElementById(key);
					if (el) {
						// Calculate intensity (0 to 1)
						// Quadratic falloff looks smoother: (1 - d/R)^2
						const intensity = Math.pow(1 - dist / RADIUS, 2);

						// Scale up to 1.2x at center to prevent filling the gaps (0.8 * 1.25 = 1.0)
						// Keeping it slightly under 1.25 ensures gaps are always visible
						const scale = 1 + intensity * 0.2;

						// Apply styles directly
						el.style.transform = `scale(${scale})`;
						// Center the scaling
						el.style.transformBox = 'fill-box';
						el.style.transformOrigin = 'center';

						dirtyKeys.add(key);
					}
				}
			}
		}
	}
</script>

<svelte:head>
	<title>Life Calendar - Anish Shrestha</title>
	<meta name="description" content="A visualization of your life in weeks." />
</svelte:head>

<!-- Restored container and max-width to match Header -->
<main class="container mx-auto min-h-screen px-4 py-8 md:px-6">
	<div class="w-full">
		<header
			class="border-border mb-10 flex flex-col items-start gap-6 border-b px-2 pb-6 md:flex-row md:items-end md:justify-between"
		>
			<div>
				<h1 class="text-text text-3xl font-bold tracking-tight">Life Calendar</h1>
				<p class="text-text-muted mt-2">
					Your life in weeks. One box represents one week of your life. Assuming a 100-year
					lifespan.
				</p>
			</div>

			<div class="flex flex-col gap-2">
				<label for="birthdate" class="text-text-muted text-xs font-medium tracking-wider uppercase">
					Date of Birth
				</label>
				<input
					type="date"
					id="birthdate"
					bind:value={birthDate}
					class="border-border bg-bg-tertiary text-text focus:border-primary rounded border px-3 py-2 text-sm focus:outline-none"
				/>
			</div>
		</header>

		<div class="w-full" in:fly={{ y: 20, duration: 500, delay: 200 }}>
			<!-- 
				SVG Grid
				viewBox: -4 -6 60 110
				- Increased margins slightly for labels
			-->
			<!-- svelte-ignore a11y_mouse_events_have_key_events -->
			<svg
				bind:this={svgRef}
				viewBox="-4 -6 60 110"
				preserveAspectRatio="xMidYMin meet"
				class="w-full touch-none select-none"
				role="img"
				aria-label="Life Calendar Grid"
				onmousemove={handleMouseMove}
				onmouseleave={handleMouseLeave}
			>
				<defs>
					<style>
						.label-text {
							font-size: 0.6px;
							fill: var(--color-text-muted);
							font-family: var(--font-family-mono);
							pointer-events: none;
						}
						.axis-title {
							font-size: 0.7px;
							fill: var(--color-text-muted);
							font-weight: 500;
							letter-spacing: 0.1px;
							text-transform: uppercase;
							pointer-events: none;
						}
						/* Smooth transition mainly for color changes, NOT for the ripple transform */
						rect {
							transition:
								fill 0.3s ease,
								stroke 0.3s ease;
							/* Will-change helps browser anticipate transform changes */
							will-change: transform;
						}
					</style>
				</defs>

				<!-- Week Labels (Top) -->
				<text x="0" y="-3.5" text-anchor="start" class="axis-title">Weeks &rarr;</text>
				{#each weeks as week}
					{#if (week + 1) % 5 === 0 || week === 0}
						<text x={week + 0.4} y="-1.5" text-anchor="middle" class="label-text">
							{week + 1}
						</text>
					{/if}
				{/each}

				<!-- Year Labels (Left) -->
				<text x="-3" y="0" text-anchor="end" transform="rotate(-90, -3, 0)" class="axis-title">
					Years &larr;
				</text>
				{#each years as year}
					{#if year % 5 === 0}
						<text x="-1" y={year + 0.6} text-anchor="end" class="label-text">
							{year}
						</text>
					{/if}
				{/each}
				<!-- Main Grid -->
				<g>
					{#each years as year}
						{#each weeks as week}
							<rect
								id={`cell-${year}-${week}`}
								x={week}
								y={year}
								width="0.8"
								height="0.8"
								rx="0.1"
								class="transition-colors duration-300"
								style:fill={isCurrent(year, week)
									? 'var(--color-primary)'
									: isLived(year, week)
										? 'var(--color-text-muted)'
										: 'transparent'}
								style:stroke={isLived(year, week) ? 'none' : 'var(--color-border)'}
								style:stroke-width="0.05"
								style:opacity={isLived(year, week) ? '0.8' : '0.5'}
							>
								<title>Year {year}, Week {week + 1}</title>
							</rect>
						{/each}
					{/each}
				</g>
			</svg>
		</div>

		<div class="text-text-muted mt-6 flex items-center gap-6 text-sm">
			<div class="flex items-center gap-2">
				<div class="bg-text-muted h-3 w-3 rounded opacity-80"></div>
				<span>Past</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="bg-primary h-3 w-3 rounded"></div>
				<span>Current</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="border-border h-3 w-3 rounded border"></div>
				<span>Future</span>
			</div>
		</div>
	</div>
</main>

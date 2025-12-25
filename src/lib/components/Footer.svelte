<script lang="ts">
	import { onMount } from 'svelte';
	const currentYear = new Date().getFullYear();
	let vimText: HTMLElement;

	// Original hover gopher state
	let showHoverGopher = $state(false);
	let hoverTimer: ReturnType<typeof setTimeout> | null = null;
	let mouseX = $state(0);
	let mouseY = $state(0);

	// Peek-a-boo gopher state
	let gopherState = $state<'hidden' | 'peeking' | 'scared' | 'waving'>('hidden');
	let gopherCorner = $state<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>(
		'bottom-right'
	);
	let gopherMessage = $state('psst... hey!');
	let peekTimer: ReturnType<typeof setTimeout> | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | null = null;
	const PEEK_DELAY = 10000; // 10 seconds before first peek
	const PEEK_AGAIN_DELAY = 8000; // 8 seconds before peeking again after hiding
	const DETECTION_RADIUS = 150; // pixels - how close mouse needs to be to scare gopher
	const CORNERS: Array<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'> = [
		'bottom-right',
		'bottom-left',
		'top-right',
		'top-left'
	];

	// Funny gopher messages
	const GOPHER_MESSAGES = [
		'psst... hey!',
		'I use Arch btw',
		'go run world.go',
		'err != nil',
		'vim > emacs',
		'nice code!',
		':wq',
		'go brrr...',
		'*happy gopher noises*',
		'concurrent!',
		'no generics? jk',
		'simplicity wins',
		'channels > mutex',
		'defer panic()',
		'select { }',
		'func main() {}',
		'import "fmt"'
	];

	function getRandomMessage() {
		return GOPHER_MESSAGES[Math.floor(Math.random() * GOPHER_MESSAGES.length)];
	}

	function getRandomCorner() {
		return CORNERS[Math.floor(Math.random() * CORNERS.length)];
	}

	function getGopherPosition(corner: typeof gopherCorner) {
		const margin = 40;
		switch (corner) {
			case 'bottom-right':
				return { x: window.innerWidth - margin, y: window.innerHeight - 60 };
			case 'bottom-left':
				return { x: margin, y: window.innerHeight - 60 };
			case 'top-right':
				return { x: window.innerWidth - margin, y: 60 };
			case 'top-left':
				return { x: margin, y: 60 };
		}
	}

	function handleMouseEnter() {
		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			showHoverGopher = true;
		}, 200);
	}

	function handleMouseLeave() {
		if (hoverTimer) clearTimeout(hoverTimer);
		showHoverGopher = false;
	}

	function handleMouseMove(event: MouseEvent) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	// Check if mouse is near the peeking gopher
	function checkGopherProximity(event: MouseEvent) {
		if (gopherState !== 'peeking' && gopherState !== 'waving') return;

		const pos = getGopherPosition(gopherCorner);

		const distance = Math.sqrt(
			Math.pow(event.clientX - pos.x, 2) + Math.pow(event.clientY - pos.y, 2)
		);

		if (distance < DETECTION_RADIUS) {
			scareGopher();
		}
	}

	function startPeekTimer() {
		if (peekTimer) clearTimeout(peekTimer);
		peekTimer = setTimeout(() => {
			if (gopherState === 'hidden') {
				gopherCorner = getRandomCorner(); // Pick random corner
				gopherState = 'peeking';
				// After peeking for a bit, start waving with a random message
				hideTimer = setTimeout(() => {
					if (gopherState === 'peeking') {
						gopherMessage = getRandomMessage();
						gopherState = 'waving';
					}
				}, 2000);
			}
		}, PEEK_DELAY);
	}

	function scareGopher() {
		gopherState = 'scared';
		if (hideTimer) clearTimeout(hideTimer);
		if (peekTimer) clearTimeout(peekTimer);

		// Hide after scared animation, then schedule next peek
		hideTimer = setTimeout(() => {
			gopherState = 'hidden';
			// Schedule the next peek after a delay from a new random corner
			peekTimer = setTimeout(() => {
				gopherCorner = getRandomCorner(); // Pick new random corner
				gopherState = 'peeking';
				// After peeking, start waving with a random message
				hideTimer = setTimeout(() => {
					if (gopherState === 'peeking') {
						gopherMessage = getRandomMessage();
						gopherState = 'waving';
					}
				}, 2000);
			}, PEEK_AGAIN_DELAY);
		}, 500);
	}

	onMount(() => {
		// Start the initial peek timer
		startPeekTimer();

		// Global mouse move listener for proximity detection
		const handleGlobalMouseMove = (event: MouseEvent) => {
			checkGopherProximity(event);
		};

		window.addEventListener('mousemove', handleGlobalMouseMove);

		return () => {
			if (hoverTimer) clearTimeout(hoverTimer);
			if (peekTimer) clearTimeout(peekTimer);
			if (hideTimer) clearTimeout(hideTimer);
			window.removeEventListener('mousemove', handleGlobalMouseMove);
		};
	});
</script>

<footer class="border-border bg-bg-secondary border-t">
	<div
		class="text-text container flex flex-col items-center justify-between gap-2 py-6 sm:flex-row"
	>
		<p>&copy; {currentYear} Anish Shrestha. All rights reserved.</p>

		<p class="text-text-muted italic">
			<span
				bind:this={vimText}
				class="vim-easter-egg"
				onmouseenter={handleMouseEnter}
				onmouseleave={handleMouseLeave}
				onmousemove={handleMouseMove}
				role="button"
				tabindex="0"
			>
				<a href="https://github.com/VoidArchive/anishshrestha.com">Made with SvelteKit</a>
			</span>
		</p>
	</div>
</footer>

<!-- Go Gopher that follows cursor (on footer hover) -->
{#if showHoverGopher}
	<div class="gopher-cursor" style="left: {mouseX + 16}px; top: {mouseY - 20}px;">
		<img src="/go-vim.svg" alt="Go Gopher with Vim" width="48" height="36" />
	</div>
{/if}

<!-- Peek-a-boo Gopher (random corner) -->
{#if gopherState !== 'hidden'}
	<div class="gopher-peekaboo {gopherState} {gopherCorner}">
		<div class="gopher-container">
			<img
				src="/go-vim.svg"
				alt="Go Gopher"
				width="64"
				height="48"
				class="gopher-img {gopherCorner}"
			/>
			{#if gopherState === 'waving'}
				<div class="speech-bubble {gopherCorner}">
					<span class="typing-text">{gopherMessage}</span>
				</div>
			{/if}
			{#if gopherState === 'scared'}
				<div class="scared-marks {gopherCorner}">!</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.vim-easter-egg {
		position: relative;
		transition: all 0.3s ease-in-out;
		cursor: pointer;
	}

	.vim-easter-egg:hover {
		background: linear-gradient(
			90deg,
			#ffffff 0%,
			#fecaca 25%,
			#f87171 50%,
			#ef4444 75%,
			#dc2626 100%
		);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 200% 100%;
		animation: gradientShift 2s ease-in-out infinite;
	}

	@keyframes gradientShift {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	.gopher-cursor {
		position: fixed;
		pointer-events: none;
		z-index: 9999;
		transition: all 0.1s ease-out;
		animation: gopherFloat 2s ease-in-out infinite;
	}

	@keyframes gopherFloat {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	/* Peek-a-boo Gopher Styles */
	.gopher-peekaboo {
		position: fixed;
		z-index: 9998;
		pointer-events: none;
	}

	/* Corner positioning */
	.gopher-peekaboo.bottom-right {
		bottom: -20px;
		right: 20px;
	}

	.gopher-peekaboo.bottom-left {
		bottom: -20px;
		left: 20px;
	}

	.gopher-peekaboo.top-right {
		top: -20px;
		right: 20px;
	}

	.gopher-peekaboo.top-left {
		top: -20px;
		left: 20px;
	}

	.gopher-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Gopher orientation based on corner */
	/* Right corners: flip horizontally to face toward screen center (left) */
	.gopher-img.bottom-right {
		transform: scaleX(-1);
	}

	/* Left corners: keep normal (faces right toward center) */
	.gopher-img.bottom-left {
		transform: none;
	}

	/* Top corners: flip vertically to hang from ceiling */
	/* Top-right: flip both X (face center) and Y (hang) */
	.gopher-img.top-right {
		transform: scaleX(-1) scaleY(-1);
	}

	/* Top-left: flip only Y (hang), face right toward center */
	.gopher-img.top-left {
		transform: scaleY(-1);
	}

	/* Peeking animations for each corner */
	.gopher-peekaboo.peeking.bottom-right,
	.gopher-peekaboo.peeking.bottom-left {
		animation: peekUpFromBottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.gopher-peekaboo.peeking.top-right,
	.gopher-peekaboo.peeking.top-left {
		animation: peekDownFromTop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	@keyframes peekUpFromBottom {
		0% {
			transform: translateY(100%);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes peekDownFromTop {
		0% {
			transform: translateY(-100%);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* Waving animation - gentle bob with excitement */
	.gopher-peekaboo.waving.bottom-right,
	.gopher-peekaboo.waving.bottom-left {
		animation: waveBottom 0.5s ease-in-out infinite;
	}

	.gopher-peekaboo.waving.top-right,
	.gopher-peekaboo.waving.top-left {
		animation: waveTop 0.5s ease-in-out infinite;
	}

	@keyframes waveBottom {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	@keyframes waveTop {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(8px);
		}
	}

	/* Wiggle animations preserving each corner's base transform */
	.gopher-peekaboo.waving.bottom-right .gopher-container img {
		animation: wiggleBottomRight 0.3s ease-in-out infinite;
	}

	.gopher-peekaboo.waving.bottom-left .gopher-container img {
		animation: wiggleBottomLeft 0.3s ease-in-out infinite;
	}

	.gopher-peekaboo.waving.top-right .gopher-container img {
		animation: wiggleTopRight 0.3s ease-in-out infinite;
	}

	.gopher-peekaboo.waving.top-left .gopher-container img {
		animation: wiggleTopLeft 0.3s ease-in-out infinite;
	}

	@keyframes wiggleBottomRight {
		0%,
		100% {
			transform: scaleX(-1) rotate(-3deg);
		}
		50% {
			transform: scaleX(-1) rotate(3deg);
		}
	}

	@keyframes wiggleBottomLeft {
		0%,
		100% {
			transform: rotate(-3deg);
		}
		50% {
			transform: rotate(3deg);
		}
	}

	@keyframes wiggleTopRight {
		0%,
		100% {
			transform: scaleX(-1) scaleY(-1) rotate(-3deg);
		}
		50% {
			transform: scaleX(-1) scaleY(-1) rotate(3deg);
		}
	}

	@keyframes wiggleTopLeft {
		0%,
		100% {
			transform: scaleY(-1) rotate(-3deg);
		}
		50% {
			transform: scaleY(-1) rotate(3deg);
		}
	}

	/* Scared animation - quick hide */
	.gopher-peekaboo.scared.bottom-right,
	.gopher-peekaboo.scared.bottom-left {
		animation: scaredHideBottom 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
	}

	.gopher-peekaboo.scared.top-right,
	.gopher-peekaboo.scared.top-left {
		animation: scaredHideTop 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
	}

	/* Shake animations preserving each corner's base transform */
	.gopher-peekaboo.scared.bottom-right .gopher-container img {
		animation: shakeBottomRight 0.1s ease-in-out 3;
	}

	.gopher-peekaboo.scared.bottom-left .gopher-container img {
		animation: shakeBottomLeft 0.1s ease-in-out 3;
	}

	.gopher-peekaboo.scared.top-right .gopher-container img {
		animation: shakeTopRight 0.1s ease-in-out 3;
	}

	.gopher-peekaboo.scared.top-left .gopher-container img {
		animation: shakeTopLeft 0.1s ease-in-out 3;
	}

	@keyframes scaredHideBottom {
		0% {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
		30% {
			transform: translateY(-10px) scale(1.1);
			opacity: 1;
		}
		100% {
			transform: translateY(150%) scale(0.8);
			opacity: 0;
		}
	}

	@keyframes scaredHideTop {
		0% {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
		30% {
			transform: translateY(10px) scale(1.1);
			opacity: 1;
		}
		100% {
			transform: translateY(-150%) scale(0.8);
			opacity: 0;
		}
	}

	@keyframes shakeBottomRight {
		0%,
		100% {
			transform: scaleX(-1) translateX(0);
		}
		25% {
			transform: scaleX(-1) translateX(-5px);
		}
		75% {
			transform: scaleX(-1) translateX(5px);
		}
	}

	@keyframes shakeBottomLeft {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px);
		}
		75% {
			transform: translateX(5px);
		}
	}

	@keyframes shakeTopRight {
		0%,
		100% {
			transform: scaleX(-1) scaleY(-1) translateX(0);
		}
		25% {
			transform: scaleX(-1) scaleY(-1) translateX(-5px);
		}
		75% {
			transform: scaleX(-1) scaleY(-1) translateX(5px);
		}
	}

	@keyframes shakeTopLeft {
		0%,
		100% {
			transform: scaleY(-1) translateX(0);
		}
		25% {
			transform: scaleY(-1) translateX(-5px);
		}
		75% {
			transform: scaleY(-1) translateX(5px);
		}
	}

	/* Speech bubble - position based on corner */
	.speech-bubble {
		position: absolute;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-primary);
		padding: 6px 12px;
		white-space: nowrap;
		box-shadow: 0 0 20px -5px var(--color-glow);
		animation: bubblePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	/* Bottom corners - bubble above */
	.speech-bubble.bottom-right,
	.speech-bubble.bottom-left {
		bottom: 100%;
		margin-bottom: 8px;
	}

	.speech-bubble.bottom-right {
		right: 0;
	}

	.speech-bubble.bottom-left {
		left: 0;
	}

	/* Top corners - bubble below */
	.speech-bubble.top-right,
	.speech-bubble.top-left {
		top: 100%;
		margin-top: 8px;
	}

	.speech-bubble.top-right {
		right: 0;
	}

	.speech-bubble.top-left {
		left: 0;
	}

	.speech-bubble::after {
		content: '';
		position: absolute;
		width: 0;
		height: 0;
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
	}

	/* Arrow pointing down for bottom corners */
	.speech-bubble.bottom-right::after,
	.speech-bubble.bottom-left::after {
		bottom: -6px;
		border-top: 6px solid var(--color-primary);
	}

	.speech-bubble.bottom-right::after {
		right: 20px;
	}

	.speech-bubble.bottom-left::after {
		left: 20px;
	}

	/* Arrow pointing up for top corners */
	.speech-bubble.top-right::after,
	.speech-bubble.top-left::after {
		top: -6px;
		border-bottom: 6px solid var(--color-primary);
	}

	.speech-bubble.top-right::after {
		right: 20px;
	}

	.speech-bubble.top-left::after {
		left: 20px;
	}

	@keyframes bubblePop {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.typing-text {
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		color: var(--color-primary);
		font-weight: 600;
	}

	/* Scared exclamation mark - positioned based on corner */
	.scared-marks {
		position: absolute;
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--color-primary);
		text-shadow: 0 0 10px var(--color-glow);
	}

	/* Bottom corners - exclamation above */
	.scared-marks.bottom-right,
	.scared-marks.bottom-left {
		top: -15px;
		animation: exclaimUp 0.2s ease-out;
	}

	.scared-marks.bottom-right {
		left: 5px;
	}

	.scared-marks.bottom-left {
		right: 5px;
	}

	/* Top corners - exclamation below (gopher is hanging) */
	.scared-marks.top-right,
	.scared-marks.top-left {
		bottom: -15px;
		animation: exclaimDown 0.2s ease-out;
	}

	.scared-marks.top-right {
		left: 5px;
	}

	.scared-marks.top-left {
		right: 5px;
	}

	@keyframes exclaimUp {
		0% {
			transform: scale(0) translateY(10px);
			opacity: 0;
		}
		50% {
			transform: scale(1.3) translateY(-5px);
			opacity: 1;
		}
		100% {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	@keyframes exclaimDown {
		0% {
			transform: scale(0) translateY(-10px);
			opacity: 0;
		}
		50% {
			transform: scale(1.3) translateY(5px);
			opacity: 1;
		}
		100% {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	/* Add glow to the peeking gopher */
	.gopher-peekaboo img {
		filter: drop-shadow(0 0 10px var(--color-glow));
		transition: filter 0.3s ease;
	}

	.gopher-peekaboo.waving img {
		filter: drop-shadow(0 0 15px var(--color-glow-strong));
	}
</style>

<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { GameOfLifeShell } from '#labs/gameoflife/index.js';
</script>

<Seo
	title="Game of Life | Anish Shrestha"
	description="Conway's Game of Life: an interactive cellular automaton. Toggle cells, insert gliders and oscillators, and watch three rules about neighbours play out."
/>

<GameOfLifeShell />

<div class="container pb-8 lg:pb-12">
	<section class="section rules" id="about">
		<h2>How Conway’s Game of Life works</h2>
		<p class="intro">
			The Game of Life has no players. You set up a grid of live and dead cells, press Play, and
			every generation each cell counts its eight neighbours and follows the same rules. Simple
			starting shapes can sit still, blink, or crawl across the board.
		</p>

		<div class="cols">
			<div>
				<h3>The rules</h3>
				<dl>
					<div>
						<dt class="caps">Birth</dt>
						<dd>A dead cell with exactly three live neighbours comes alive.</dd>
					</div>
					<div>
						<dt class="caps">Survival</dt>
						<dd>A live cell with two or three live neighbours stays alive.</dd>
					</div>
					<div>
						<dt class="caps">Death</dt>
						<dd>Any other live cell dies, from loneliness under two or crowding over three.</dd>
					</div>
				</dl>
				<p>People write this rule as B3/S23: born on 3, survives on 2 or 3.</p>

				<h3>Using the controls</h3>
				<ol>
					<li>Tap a cell to flip it between alive and dead. Editing pauses a running board.</li>
					<li>Play runs it. Step moves one generation at a time while paused.</li>
					<li>
						Speed goes from one generation a second up to one every 0.05 seconds. Grid size goes
						from 20×15 up to 150×100. Change both while paused.
					</li>
					<li>Randomize fills about a quarter of the cells. Clear Grid wipes the board.</li>
					<li>
						Wrap edges joins opposite sides, so something leaving on the right comes back on the
						left.
					</li>
				</ol>
			</div>

			<div>
				<h3>Patterns to try</h3>
				<p>
					The pattern library has four tabs: Still Lifes, Oscillators, Spaceships and Complex. Pick
					one, check the preview, then pause and press Insert at Center.
				</p>
				<dl>
					<div>
						<dt class="caps">Glider</dt>
						<dd>Five cells that travel diagonally across the grid.</dd>
					</div>
					<div>
						<dt class="caps">Pulsar</dt>
						<dd>A big oscillator that repeats every three generations.</dd>
					</div>
					<div>
						<dt class="caps">Glider gun</dt>
						<dd>
							The Gosper Glider Gun, the first gun ever found. It keeps firing gliders. It is 36
							cells wide, so use Medium or bigger.
						</dd>
					</div>
					<div>
						<dt class="caps">R-pentomino</dt>
						<dd>
							Five cells that turn into chaos. On an endless grid it takes 1103 generations to
							settle.
						</dd>
					</div>
				</dl>
				<p>For a calm one, try Block or Beehive from Still Lifes. They never change at all.</p>
			</div>
		</div>

		<p class="more">
			<a href="/blog/building-conways-game-of-life-svelte">How I built it in SvelteKit</a>
			· <a href="/blog/game-of-life-on-a-phone">Making every cell tappable on a phone</a>
		</p>
	</section>
</div>

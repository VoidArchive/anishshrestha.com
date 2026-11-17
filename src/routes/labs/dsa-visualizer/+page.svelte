<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import Shell from '#labs/dsa-visualizer/ui/Shell.svelte';
</script>

<Seo
	title="DSA Visualizer | Anish Shrestha"
	description="An interactive visualizer for six sorting and four pathfinding algorithms, drawn one step at a time with comparisons and swaps counted."
/>

<Shell />

<div class="container pb-8 lg:pb-12">
	<section class="section rules" id="about">
		<h2>What the visualizer shows</h2>
		<p class="intro">
			This draws ten algorithms one step at a time: six that sort an array of bars and four that
			find a path across a grid. Pick Sorting or Pathfinding, choose one from the list and press
			Play, or step forward and back by hand.
		</p>

		<div class="cols">
			<div>
				<h3>Sorting</h3>
				<dl>
					<div>
						<dt class="caps">Bubble</dt>
						<dd>Swaps neighbours that are out of order, pass after pass.</dd>
					</div>
					<div>
						<dt class="caps">Selection</dt>
						<dd>Finds the smallest value left and moves it to the front.</dd>
					</div>
					<div>
						<dt class="caps">Insertion</dt>
						<dd>Slides each new value back into an already sorted part.</dd>
					</div>
					<div>
						<dt class="caps">Quick</dt>
						<dd>Splits around a pivot, then sorts each side.</dd>
					</div>
					<div>
						<dt class="caps">Merge</dt>
						<dd>Sorts halves separately and merges them back together.</dd>
					</div>
					<div>
						<dt class="caps">Heap</dt>
						<dd>Builds a heap, then pulls the largest value off one at a time.</dd>
					</div>
				</dl>
				<p>
					Each bar is a value. The pair being compared turns dark, and bars in their final place get
					a rule along the top. The reading under the board counts comparisons and swaps. Try bubble
					sort and then quick sort at the same array size and compare the numbers.
				</p>
			</div>

			<div>
				<h3>Pathfinding</h3>
				<dl>
					<div>
						<dt class="caps">BFS</dt>
						<dd>Spreads out one ring at a time. Finds a shortest path.</dd>
					</div>
					<div>
						<dt class="caps">DFS</dt>
						<dd>Runs down one direction as far as it can. The path is often long.</dd>
					</div>
					<div>
						<dt class="caps">Dijkstra</dt>
						<dd>
							Expands the closest cell first. Every step costs 1 here, so its path is as short as
							BFS’s.
						</dd>
					</div>
					<div>
						<dt class="caps">A*</dt>
						<dd>Dijkstra plus a guess of the distance left, so it heads toward the end.</dd>
					</div>
				</dl>
				<p>
					Tap or drag on the grid to draw walls, or switch the tool to place the start and end.
					Visited cells show where the search has been, the frontier is what it will look at next,
					and the path appears once it reaches the end. Moves go up, down, left and right only.
				</p>
			</div>
		</div>

		<p class="more">
			<a href="/blog/building-dsa-visualizer-animation-engine">How the animation engine works</a>
			·
			<a href="/blog/pathfinding-visualizer-forgot-its-past"
				>Why the pathfinding grid forgot its past</a
			>
		</p>
	</section>
</div>

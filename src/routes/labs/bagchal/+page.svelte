<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import Shell from '#labs/bagchal/ui/Shell.svelte';
</script>

<Seo
	title="Play Bagh Chal Online: Tigers and Goats | Anish Shrestha"
	description="Play Bagh Chal (Bagchal), the Nepali tigers and goats board game, online against a minimax opponent. Full rules below the board."
/>

<main class="container py-8 lg:py-12">
	<Shell />

	<section class="section rules" id="rules">
		<h2>How to play Bagh Chal</h2>
		<p class="intro">
			Bagh Chal, also written Bagchal or Baghchal (बाघचाल, “tiger’s move”), is a two-player game
			from Nepal. One side has four tigers, the other has twenty goats. The sides are unequal on
			purpose: tigers hunt, and goats crowd them until they cannot move.
		</p>

		<div class="cols">
			<div>
				<h3>The board</h3>
				<p>
					Pieces sit on the 25 points where the lines cross, not inside the squares. A piece moves
					along a line to the next point. Not every point has diagonals, so check the lines before
					you plan a move.
				</p>
				<p>The four tigers start on the four corners. The goats start off the board.</p>

				<h3>How to win</h3>
				<dl>
					<div>
						<dt class="caps">Tigers</dt>
						<dd>Capture five goats.</dd>
					</div>
					<div>
						<dt class="caps">Goats</dt>
						<dd>Block every tiger so that none of them has a legal move.</dd>
					</div>
					<div>
						<dt class="caps">Draw</dt>
						<dd>The same position comes up five times, or 51 moves pass without a capture.</dd>
					</div>
				</dl>
			</div>

			<div>
				<h3>A turn, step by step</h3>
				<ol>
					<li>Goats go first. The two sides then take turns.</li>
					<li>
						While goats are still off the board, a goat turn is placing one goat on any empty point.
						This is the placement phase. Goats on the board cannot move yet.
					</li>
					<li>
						Once all twenty goats are placed, the movement phase starts: a goat turn is sliding one
						goat along a line to an empty neighbouring point.
					</li>
					<li>
						Tigers move from their first turn. A tiger either slides one point along a line, or
						captures.
					</li>
					<li>
						To capture, a tiger jumps over a goat next to it, in a straight line, and lands on the
						empty point right behind. That goat is removed. One goat per jump, and never over
						another tiger.
					</li>
					<li>Goats never jump and never capture.</li>
				</ol>

				<h3>If you are new</h3>
				<p>
					As goats, keep to the edges early and fill in behind your own pieces: a goat with a goat
					behind it cannot be jumped. As tigers, stay spread out and avoid corners late in the game,
					because a cornered tiger is the easiest one to trap.
				</p>
			</div>
		</div>

		<p class="more">
			<a href="/blog/bagchal-reforged-ai-chess-tigers">How the computer opponent was built</a>
		</p>
	</section>
</main>

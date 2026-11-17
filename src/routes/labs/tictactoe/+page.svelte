<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import Shell from '#labs/tictactoe/ui/Shell.svelte';
</script>

<Seo
	title="Tic Tac Toe | Anish Shrestha"
	description="Play Tic Tac Toe against an unbeatable minimax player, or a friend, in the browser."
/>

<section class="container py-8 lg:py-12">
	<Shell />

	<section class="section rules" id="about">
		<h2>How to play Tic Tac Toe</h2>
		<p class="intro">
			Two players take turns putting an X or an O on a three by three grid. Three of yours in a row,
			across, down or diagonally, wins. If the board fills up with no line, it’s a draw.
		</p>

		<div class="cols">
			<div>
				<h3>Modes</h3>
				<dl>
					<div>
						<dt class="caps">AI</dt>
						<dd>You play the computer. This is the default.</dd>
					</div>
					<div>
						<dt class="caps">Human</dt>
						<dd>Two people share one screen and take turns.</dd>
					</div>
					<div>
						<dt class="caps">Play as</dt>
						<dd>
							Against the computer you can be X or O. X always moves first, so picking O lets the
							computer open.
						</dd>
					</div>
				</dl>
				<p>
					Changing the mode or your side starts a new game. The line under the board keeps score for
					this visit: wins, draws and losses against the computer, or each side’s wins in a
					two-player game. Reload and it starts from zero.
				</p>
			</div>

			<div>
				<h3>Why you can’t beat it</h3>
				<p>
					The computer uses minimax. Before each move it plays out every possible rest of the game,
					assumes you’ll always answer with your best move, and picks the move whose worst outcome
					is best for it. Tic Tac Toe is small enough to search all the way to the end, nine moves
					deep, so it never has to guess.
				</p>
				<p>
					With both sides playing perfectly the game is a draw, which makes a draw the best you can
					get. If you slip and leave it a forced win, it will take it.
				</p>
			</div>
		</div>

		<p class="more">
			<a href="/labs/bagchal">The same minimax code plays tigers and goats in Bagh Chal</a>
		</p>
	</section>
</section>

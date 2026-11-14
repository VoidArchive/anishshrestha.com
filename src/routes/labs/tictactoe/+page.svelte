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
</section>

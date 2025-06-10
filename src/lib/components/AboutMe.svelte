<script>
	import { User } from 'lucide-svelte';
</script>

<section class="section-card">
	<h2 class="section-title">
		<User size={20} class="inline" /> About Me
	</h2>
	<div class="space-y-4">
		<p class="text-text-primary leading-relaxed">Hi, I am anish.</p>
		<p class="text-text-primary leading-relaxed">
			I am a software engineer based in Nepal. I architect distributed systems primarily in
			Go, with Python for data-heavy workloads. My frontend philosophy is radical
			minimalism: SvelteKit when interactivity matters, HTMX when it doesn't.
		</p>
		<p class="text-text-primary leading-relaxed">
			I believe most software is overengineered. I prioritize predictable performance over
			clever abstractions.
		</p>
		<p class="text-text-secondary italic">I use vim btw.</p>
	</div>
</section> 
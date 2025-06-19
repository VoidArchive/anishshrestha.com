<script>
	import { Link, Mail, Github, ShieldHalf, Linkedin } from 'lucide-svelte';
</script>

<section class="section-card">
	<h2 class="section-title">
		<Link size={20} class="text-primary inline" /> Links
	</h2>
	<div class="flex flex-col space-y-1">
		<a
			href="mailto:hi@anishshrestha.com"
			class="text-text-muted py-1r flex items-center gap-2 px-2"
		>
			<Mail size={16} class="text-primary" /> hi@anishshrestha.com
		</a>
		<a
			href="https://github.com/VoidArchive"
			target="_blank"
			rel="noopener noreferrer"
			class="text-text-muted flex items-center gap-2 px-2 py-1"
		>
			<Github size={16} class="text-primary" /> GitHub
		</a>
		<a
			href="https://linkedin.com/in/theinanish"
			target="_blank"
			rel="noopener noreferrer"
			class="text-text-muted flex items-center gap-2 px-2 py-1"
		>
			<Linkedin size={16} class="text-primary" /> LinkedIn
		</a>
		<a
			href="https://boot.dev/u/kshatrya"
			target="_blank"
			rel="noopener noreferrer"
			class="text-text-muted flex items-center gap-2 px-2 py-1"
		>
			<ShieldHalf size={16} class="text-primary" /> Boot.dev
		</a>
	</div>
</section>

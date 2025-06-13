<script>
	import { Link, Mail, Github, ShieldHalf, Linkedin } from 'lucide-svelte';
</script>

<section class="section-card">
	<h2 class="section-title">
		<Link size={20} class="inline" /> Links
	</h2>
	<div class="flex flex-col space-y-1">
		<a
			href="mailto:hi@anishshrestha.com"
			class="text-text-secondary hover:text-primary-red hover:border-border hover:bg-bg-primary flex items-center gap-2 border border-transparent px-2 py-1 transition-all duration-300"
		>
			<Mail size={16} class="text-primary-red" /> hi@anishshrestha.com
		</a>
		<a
			href="https://github.com/VoidArchive"
			target="_blank"
			rel="noopener noreferrer"
			class="text-text-secondary hover:text-primary-red hover:border-border hover:bg-bg-primary flex items-center gap-2 border border-transparent px-2 py-1 transition-all duration-300"
		>
			<Github size={16} class="text-primary-red" /> GitHub
		</a>
		<a
			href="https://linkedin.com/in/theinanish"
			target="_blank"
			rel="noopener noreferrer"
			class="text-text-secondary hover:text-primary-red hover:border-border hover:bg-bg-primary flex items-center gap-2 border border-transparent px-2 py-1 transition-all duration-300"
		>
			<Linkedin size={16} class="text-primary-red" /> LinkedIn
		</a>
		<a
			href="https://boot.dev/u/kshatrya"
			target="_blank"
			rel="noopener noreferrer"
			class="text-text-secondary hover:text-primary-red hover:border-border hover:bg-bg-primary flex items-center gap-2 border border-transparent px-2 py-1 transition-all duration-300"
		>
			<ShieldHalf size={16} class="text-primary-red" /> Boot.dev
		</a>
	</div>
</section>

<script>
	import { Link, Mail, Github, Linkedin, Target } from 'lucide-svelte';
</script>

<section class="section-card">
	<h2 class="section-title">
		<Link size={20} class="inline" /> Links
	</h2>
	<ul class="flex flex-col gap-3">
		<li>
			<a href="mailto:hi@anishshrestha.com" class="text-text-secondary transition-all duration-300 p-2 rounded border border-transparent hover:text-primary-red hover:border-border hover:bg-bg-primary block flex items-center gap-2">
				<Mail size={16} /> hi@anishshrestha.com
			</a>
		</li>
		<li>
			<a href="https://github.com" target="_blank" rel="noopener noreferrer" class="text-text-secondary transition-all duration-300 p-2 rounded border border-transparent hover:text-primary-red hover:border-border hover:bg-bg-primary block flex items-center gap-2">
				<Github size={16} /> GitHub
			</a>
		</li>
		<li>
			<a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="text-text-secondary transition-all duration-300 p-2 rounded border border-transparent hover:text-primary-red hover:border-border hover:bg-bg-primary block flex items-center gap-2">
				<Linkedin size={16} /> LinkedIn
			</a>
		</li>
		<li>
			<a href="https://boot.dev" target="_blank" rel="noopener noreferrer" class="text-text-secondary transition-all duration-300 p-2 rounded border border-transparent hover:text-primary-red hover:border-border hover:bg-bg-primary block flex items-center gap-2">
				<Target size={16} /> Boot.dev
			</a>
		</li>
	</ul>
</section> 
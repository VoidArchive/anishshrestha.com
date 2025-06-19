<script>
	import { Code, Database, Globe, FileCode, Zap } from 'lucide-svelte';
</script>

<section class="section-card">
	<h2 class="section-title flex items-center gap-2">
		<Code size={20} class="text-primary inline" /> Tech Stack
	</h2>

	<div class="space-y-4">
		<div>
			<h3 class="text-primary mb-2 text-sm font-semibold">Backend</h3>
			<div class="space-y-1">
				<div
					class="hover:border-primary hover:text-text flex items-center border-b border-transparent py-1 transition-all duration-300"
				>
					<span class="flex items-center gap-2">
						<Code size={16} class="text-primary" />
						Go
					</span>
				</div>
				<div
					class="hover:border-primary hover:text-text flex items-center border-b border-transparent py-1 transition-all duration-300"
				>
					<span class="flex items-center gap-2">
						<Zap size={16} class="text-primary" />
						Python
					</span>
				</div>
				<div
					class="hover:border-primary hover:text-text flex items-center border-b border-transparent py-1 transition-all duration-300"
				>
					<span class="flex items-center gap-2">
						<Database size={16} class="text-primary" />
						PostgreSQL
					</span>
				</div>
			</div>
		</div>

		<div>
			<h3 class="text-primary mb-2 text-sm font-semibold">Frontend</h3>
			<div class="space-y-1">
				<div
					class="hover:border-primary hover:text-text flex items-center border-b border-transparent py-1 transition-all duration-300"
				>
					<span class="flex items-center gap-2">
						<Globe size={16} class="text-primary" />
						SvelteKit
					</span>
				</div>
				<div
					class="hover:border-primary hover:text-text flex items-center border-b border-transparent py-1 transition-all duration-300"
				>
					<span class="flex items-center gap-2">
						<FileCode size={16} class="text-primary" />
						TypeScript
					</span>
				</div>
			</div>
		</div>
	</div>
</section>

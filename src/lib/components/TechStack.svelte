<script>
	import { Code, Database, Globe, FileCode, Zap } from 'lucide-svelte';
</script>

<section class="section-card">
	<h2 class="section-title flex items-center gap-2">
		<Code size={20} class="inline" /> Tech Stack
	</h2>

	<div class="space-y-4">
		<div>
			<h3 class="text-primary-red mb-2 text-sm font-semibold">Backend & Systems</h3>
			<div class="space-y-1">
				<div
					class="hover:border-primary-red hover:text-text-primary flex items-center border-b border-transparent py-1 transition-all duration-300"
				>
					<span class="flex items-center gap-2">
						<Zap size={16} class="text-primary-red" />
						Go
					</span>
				</div>
				<div
					class="hover:border-primary-red hover:text-text-primary flex items-center border-b border-transparent py-1 transition-all duration-300"
				>
					<span class="flex items-center gap-2">
						<Code size={16} class="text-primary-red" />
						Python
					</span>
				</div>
				<div
					class="hover:border-primary-red hover:text-text-primary flex items-center border-b border-transparent py-1 transition-all duration-300"
				>
					<span class="flex items-center gap-2">
						<Database size={16} class="text-primary-red" />
						PostgreSQL
					</span>
				</div>
			</div>
		</div>

		<div>
			<h3 class="text-primary-red mb-2 text-sm font-semibold">Frontend</h3>
			<div class="space-y-1">
				<div
					class="hover:border-primary-red hover:text-text-primary flex items-center border-b border-transparent py-1 transition-all duration-300"
				>
					<span class="flex items-center gap-2">
						<Globe size={16} class="text-primary-red" />
						SvelteKit
					</span>
				</div>
				<div
					class="hover:border-primary-red hover:text-text-primary flex items-center border-b border-transparent py-1 transition-all duration-300"
				>
					<span class="flex items-center gap-2">
						<FileCode size={16} class="text-primary-red" />
						TypeScript
					</span>
				</div>
			</div>
		</div>
	</div>
</section>

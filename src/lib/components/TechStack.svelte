<script>
	import { Code, Database, Globe, FileCode, Zap } from 'lucide-svelte';
</script>

<section class="section-card">
	<h2 class="section-title flex items-center gap-2">
		<Code size={20} class="inline" /> Tech Stack
	</h2>
	
	<div class="space-y-4">
		<div>
			<h3 class="text-primary-red text-sm font-semibold mb-2">Backend & Systems</h3>
			<div class="space-y-1">
				<div class="flex items-center py-1 border-b border-transparent transition-all duration-300 hover:border-primary-red hover:text-text-primary">
					<span class="flex items-center gap-2">
						<Zap size={16} class="text-primary-red" />
						Go
					</span>
				</div>
				<div class="flex items-center py-1 border-b border-transparent transition-all duration-300 hover:border-primary-red hover:text-text-primary">
					<span class="flex items-center gap-2">
						<Code size={16} class="text-primary-red" />
						Python
					</span>
				</div>
				<div class="flex items-center py-1 border-b border-transparent transition-all duration-300 hover:border-primary-red hover:text-text-primary">
					<span class="flex items-center gap-2">
						<Database size={16} class="text-primary-red" />
						PostgreSQL
					</span>
				</div>
			</div>
		</div>
		
		<div>
			<h3 class="text-primary-red text-sm font-semibold mb-2">Frontend</h3>
			<div class="space-y-1">
				<div class="flex items-center py-1 border-b border-transparent transition-all duration-300 hover:border-primary-red hover:text-text-primary">
					<span class="flex items-center gap-2">
						<Globe size={16} class="text-primary-red" />
						SvelteKit
					</span>
				</div>
				<div class="flex items-center py-1 border-b border-transparent transition-all duration-300 hover:border-primary-red hover:text-text-primary">
					<span class="flex items-center gap-2">
						<FileCode size={16} class="text-primary-red" />
						TypeScript
					</span>
				</div>
			</div>
		</div>
	</div>
</section> 
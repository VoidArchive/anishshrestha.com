<!--
About Me Component

Personal introduction with improved content structure and engagement.
Enhanced with better readability and subtle visual improvements.
-->

<script lang="ts">
	import { User, Briefcase } from 'lucide-svelte';
</script>

<section class="section-card">
	<h2 class="section-title">
		<User size={20} class="text-primary inline" /> About Me
	</h2>
	<div class="about-content">
		<!-- Introduction -->
		<div class="intro-section">
			<p class="intro-text">
				Hi, I'm Anish. I'm a software developer from Nepal who loves building innovative solutions
				and bringing ideas to life through code.
			</p>
		</div>

		<!-- Current work -->
		<div class="work-section">
			<div class="work-header">
				<Briefcase size={16} class="text-primary" />
				<span class="work-label">Currently</span>
			</div>
			<p class="work-description">
				Building full-stack applications at <a
					href="https://www.globalsquareit.com"
					class="company-link"
					target="_blank"
					rel="noopener noreferrer">Global Square</a
				>, crafting scalable systems from database design to user interfaces, with expertise in
				modern web technologies and distributed architectures.
			</p>
		</div>

		<!-- Background -->
		<div class="background-section">
			<p class="background-text">
				I specialize in full-stack development, creating everything from interactive visualizers and
				games to enterprise applications. My experience spans frontend frameworks, backend services,
				database design, and DevOps practices - bringing complete software solutions to life.
			</p>

			<!-- Additional detail for SEO and AI understanding -->
			<p class="background-text">
				My work includes building scalable web applications, implementing complex algorithms,
				creating interactive user experiences, and solving challenging software engineering
				problems. I enjoy working across the entire technology stack and have experience with both
				startup environments and enterprise systems.
			</p>
		</div>
	</div>
</section>

<style>
	.about-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.intro-section {
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}

	.intro-text {
		color: var(--color-text);
		font-size: 1rem;
		line-height: 1.6;
		font-weight: 500;
	}

	.work-section,
	.background-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.work-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.work-label {
		color: var(--color-text);
		font-weight: 600;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.work-description,
	.background-text {
		color: var(--color-text);
		line-height: 1.6;
		font-size: 0.9rem;
	}

	.company-link {
		color: var(--color-primary);
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
		border-bottom: 1px solid transparent;
	}

	.company-link:hover {
		border-bottom-color: var(--color-primary);
		color: #ef4444;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.about-content {
			gap: var(--space-3);
		}
	}
</style>

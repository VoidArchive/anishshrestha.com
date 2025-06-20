<!--
Profile Stats Component

Displays interesting metrics and achievements about the portfolio.
Shows lab interactions, project count, and fun stats with animated counters
and hover effects to add personality to the profile section.
-->

<script lang="ts">
	import { Trophy, Code, Activity, Zap } from 'lucide-svelte';
	import { onMount } from 'svelte';

	// Stats data - could be made dynamic in the future
	const stats = [
		{ icon: Code, label: 'Labs Built', value: 4, suffix: '', color: 'primary' },
		{ icon: Trophy, label: 'Years Coding', value: 2, suffix: '+', color: 'secondary' },
		{ icon: Activity, label: 'Projects Completed', value: 8, suffix: '', color: 'tertiary' },
		{ icon: Zap, label: 'Coffee Cups', value: 1247, suffix: '', color: 'quaternary' }
	];

	let mounted = false;
	let displayValues = stats.map(() => 0);

	// Animate counters on mount
	onMount(() => {
		mounted = true;

		stats.forEach((stat, index) => {
			const targetValue = stat.value;
			const duration = 2000; // 2 seconds
			const startTime = Date.now();
			// const increment = targetValue / (duration / 16); // ~60fps // Unused variable removed

			const animate = () => {
				const elapsed = Date.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);

				// Easing function for smooth animation
				const easeOut = 1 - Math.pow(1 - progress, 3);
				displayValues[index] = Math.floor(targetValue * easeOut);

				if (progress < 1) {
					requestAnimationFrame(animate);
				} else {
					displayValues[index] = targetValue;
				}
			};

			// Stagger animations
			setTimeout(() => {
				animate();
			}, index * 200);
		});
	});
</script>

<section class="profile-stats">
	<div class="stats-grid">
		{#each stats as stat, index (stat.label)}
			<div class="stat-item {stat.color}">
				<div class="stat-icon">
					<svelte:component this={stat.icon} size={18} />
				</div>
				<div class="stat-content">
					<div class="stat-value">
						{mounted ? displayValues[index].toLocaleString() : '0'}{stat.suffix}
					</div>
					<div class="stat-label">{stat.label}</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.profile-stats {
		margin-bottom: var(--space-4);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.stat-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
		transition: left 0.5s ease;
	}

	.stat-item:hover::before {
		left: 100%;
	}

	.stat-item:hover {
		transform: translateY(-2px);
		border-color: var(--color-primary);
		box-shadow: 0 4px 15px -2px rgba(201, 42, 42, 0.15);
	}

	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		transition: all 0.3s ease;
		flex-shrink: 0;
		background: rgba(201, 42, 42, 0.1);
		color: var(--color-primary);
	}

	.stat-item:hover .stat-icon {
		transform: scale(1.1);
		background: rgba(201, 42, 42, 0.15);
	}

	.stat-content {
		min-width: 0;
		flex: 1;
	}

	.stat-value {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text);
		line-height: 1.2;
		font-family: var(--font-family-mono);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 500;
	}

	/* Mobile responsiveness */
	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.stat-item {
			padding: var(--space-3);
		}
	}
</style>

<script lang="ts">
	/*
	Error Page Component
	
	Provides user-friendly error messages and navigation options
	when something goes wrong in the application. Matches the site's
	design theme and provides helpful recovery options.
	*/

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import TwoColumnShell from '$lib/layouts/TwoColumnShell.svelte';
	import { Home, ArrowLeft, RefreshCw, Bug, AlertTriangle } from 'lucide-svelte';

	// Get error details from the page state
	let errorStatus = $derived(page.status);
	let errorMessage = $derived(page.error?.message || 'An unexpected error occurred');

	// Determine error type and appropriate message
	function getErrorDetails(status: number, message: string) {
		switch (status) {
			case 404:
				return {
					title: 'Page Not Found',
					message: "The page you're looking for doesn't exist or has been moved.",
					suggestion: 'Check the URL or navigate back to safety.',
					icon: AlertTriangle,
					color: 'var(--color-primary-red)'
				};
			case 500:
				return {
					title: 'Server Error',
					message: 'Something went wrong on our end. Please try again later.',
					suggestion: 'If the problem persists, please report this issue.',
					icon: Bug,
					color: 'var(--color-primary-red)'
				};
			case 403:
				return {
					title: 'Access Forbidden',
					message: "You don't have permission to access this resource.",
					suggestion: 'Please check your credentials or contact support.',
					icon: AlertTriangle,
					color: '#f59e0b'
				};
			default:
				return {
					title: 'Something Went Wrong',
					message: message,
					suggestion: 'Please try refreshing the page or go back to the homepage.',
					icon: AlertTriangle,
					color: 'var(--color-primary-red)'
				};
		}
	}

	let errorDetails = $derived(getErrorDetails(errorStatus, errorMessage));

	// Navigation functions
	function goHome() {
		goto('/');
	}

	function goBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back();
		} else {
			goto('/');
		}
	}

	function refresh() {
		if (typeof window !== 'undefined') {
			window.location.reload();
		}
	}

	function reportIssue() {
		const subject = `Error Report: ${errorStatus} - ${errorDetails.title}`;
		const body = `Error Details:\n- Status: ${errorStatus}\n- Message: ${errorMessage}\n- URL: ${page.url.pathname}\n- User Agent: ${typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}`;
		const mailtoLink = `mailto:hi@anishshrestha.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

		if (typeof window !== 'undefined') {
			window.location.href = mailtoLink;
		}
	}
</script>

<svelte:head>
	<title>{errorStatus} - {errorDetails.title} | anishshrestha.com</title>
	<meta
		name="description"
		content="Error {errorStatus}: {errorDetails.title}. Return to Anish Shrestha's portfolio safely."
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="container" style="padding-top: var(--space-8); padding-bottom: var(--space-8);">
	<TwoColumnShell>
		{#snippet left()}
			<!-- Error summary -->
			<section class="section-card">
				<h3 class="section-title text-lg">Error Details</h3>
				<div class="error-summary">
					<div class="error-code" style="color: {errorDetails.color};">
						{errorStatus}
					</div>
					<p class="text-text-muted text-sm leading-relaxed">
						{errorDetails.suggestion}
					</p>
				</div>
			</section>

			<!-- Quick actions -->
			<section class="section-card">
				<h3 class="section-title text-lg">Quick Fix</h3>
				<div class="quick-actions" style="gap: var(--space-3);">
					<button class="action-btn primary" onclick={refresh} aria-label="Refresh current page">
						<RefreshCw size={16} />
						<span>Try Again</span>
					</button>
				</div>
			</section>
		{/snippet}

		<!-- Main error display -->
		<div
			class="flex flex-col items-center justify-center text-center"
			style="min-height: 400px; gap: var(--space-6);"
		>
			<!-- Error icon -->
			<div class="error-icon" style="color: {errorDetails.color};" aria-hidden="true">
				<errorDetails.icon size={120} />
			</div>

			<!-- Error content -->
			<div class="error-content" style="gap: var(--space-4);">
				<h1 class="error-title">
					{errorDetails.title}
				</h1>
				<p class="error-message text-text-muted">
					{errorDetails.message}
				</p>

				<!-- Development error details -->
				{#if import.meta.env.DEV && errorMessage !== errorDetails.message}
					<details class="error-details">
						<summary class="text-text-muted cursor-pointer text-sm">
							Technical Details (Development)
						</summary>
						<pre class="error-stack">{errorMessage}</pre>
					</details>
				{/if}
			</div>

			<!-- Primary action buttons -->
			<div class="error-actions" style="gap: var(--space-4);">
				<button class="btn primary-btn" onclick={goHome}>
					<Home size={16} />
					<span>Return Home</span>
				</button>
				<button class="btn secondary-btn" onclick={goBack}>
					<ArrowLeft size={16} />
					<span>Go Back</span>
				</button>
			</div>

			<!-- Report issue link -->
			{#if errorStatus >= 400}
				<div class="report-section">
					<button class="report-link text-text-muted text-sm" onclick={reportIssue}>
						<Bug size={14} />
						<span>Report this issue</span>
					</button>
				</div>
			{/if}
		</div>
	</TwoColumnShell>
</main>

<style>
	.error-summary {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		align-items: center;
		text-align: center;
	}

	.error-code {
		font-size: 3rem;
		font-weight: 700;
		font-family: var(--font-mono);
		line-height: 1;
	}

	.quick-actions {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
		text-decoration: none;
		transition: all 0.2s ease;
		cursor: pointer;
		font-size: 0.875rem;
		width: 100%;
		justify-content: flex-start;
	}

	.action-btn:hover {
		background: var(--color-bg-tertiary);
		border-color: var(--color-primary-red);
	}

	.action-btn.primary {
		background: var(--color-primary-red);
		border-color: var(--color-primary-red);
		color: white;
	}

	.action-btn.primary:hover {
		background: #b91c1c;
		border-color: #b91c1c;
	}

	.error-icon {
		opacity: 0.8;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.8;
		}
		50% {
			opacity: 0.4;
		}
	}

	.error-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 600px;
	}

	.error-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.2;
	}

	.error-message {
		font-size: 1.125rem;
		line-height: 1.6;
		margin: 0;
		max-width: 500px;
	}

	.error-details {
		margin-top: var(--space-4);
		padding: var(--space-3);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		text-align: left;
		max-width: 100%;
	}

	.error-details summary {
		font-weight: 600;
		margin-bottom: var(--space-2);
	}

	.error-stack {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-primary-red);
		overflow-x: auto;
		white-space: pre-wrap;
		margin: 0;
		padding-top: var(--space-2);
	}

	.error-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
	}

	.primary-btn {
		background: var(--color-primary-red);
		border-color: var(--color-primary-red);
		color: white;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		font-weight: 600;
	}

	.primary-btn:hover {
		background: #b91c1c;
		border-color: #b91c1c;
	}

	.secondary-btn {
		background: var(--color-bg-secondary);
		border-color: var(--color-border);
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
	}

	.secondary-btn:hover {
		background: var(--color-bg-tertiary);
		border-color: var(--color-primary-red);
	}

	.report-section {
		margin-top: var(--space-2);
	}

	.report-link {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		background: none;
		border: none;
		cursor: pointer;
		transition: color 0.2s ease;
		text-decoration: underline;
	}

	.report-link:hover {
		color: var(--color-text-primary);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.error-title {
			font-size: 2rem;
		}

		.error-message {
			font-size: 1rem;
		}

		.error-actions {
			flex-direction: column;
			width: 100%;
		}

		.primary-btn,
		.secondary-btn {
			width: 100%;
			justify-content: center;
		}

		.error-code {
			font-size: 2.5rem;
		}
	}

	@media (max-width: 480px) {
		.error-icon :global(svg) {
			width: 80px;
			height: 80px;
		}

		.error-title {
			font-size: 1.75rem;
		}

		.error-code {
			font-size: 2rem;
		}
	}
</style>

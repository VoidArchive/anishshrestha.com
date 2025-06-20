<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		fallback?: string;
		onError?: (error: Error) => void;
	}

	let {
		fallback = 'Something went wrong with the game.',
		onError,
		children
	}: Props & { children?: import('svelte').Snippet } = $props();

	let hasError = $state(false);
	let error: Error | null = $state(null);

	let originalErrorHandler: OnErrorEventHandler | null = null;

	onMount(() => {
		// Store original error handler
		originalErrorHandler = window.onerror;

		// Set up global error handler
		window.onerror = (message, filename, lineno, colno, errorObj) => {
			const err = errorObj || new Error(String(message));
			handleError(err);
			return true; // Prevent default handling
		};

		// Handle unhandled promise rejections
		window.addEventListener('unhandledrejection', (event) => {
			const err = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
			handleError(err);
		});
	});

	onDestroy(() => {
		// Restore original error handler
		if (originalErrorHandler) {
			window.onerror = originalErrorHandler;
		}
	});

	function handleError(err: Error) {
		hasError = true;
		error = err;

		if (import.meta.env.DEV) {
			console.error('ErrorBoundary caught error:', error);
		}

		onError?.(error);
	}

	function handleReset() {
		hasError = false;
		error = null;
	}

	function handleReload() {
		window.location.reload();
	}
</script>

{#if hasError}
	<div class="error-boundary">
		<div class="error-card">
			<div class="error-icon">⚠️</div>
			<h2 class="error-title">Game Error</h2>
			<p class="error-message">{fallback}</p>

			{#if import.meta.env.DEV && error}
				<details class="error-details">
					<summary>Error Details (Development)</summary>
					<pre class="error-stack">{error.message}\n{error.stack}</pre>
				</details>
			{/if}

			<div class="error-actions">
				<button class="error-btn primary" onclick={handleReset}> Try Again </button>
				<button class="error-btn secondary" onclick={handleReload}> Reload Page </button>
			</div>
		</div>
	</div>
{:else}
	{@render children?.()}
{/if}

<style>
	.error-boundary {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: 2rem;
	}

	.error-card {
		background: var(--color-bg-primary);
		border: 2px solid var(--color-border);
		max-width: 500px;
		width: 100%;
		padding: 2rem;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}

	.error-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.error-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--color-text-primary);
		margin: 0 0 1rem;
	}

	.error-message {
		color: var(--color-text-secondary);
		margin: 0 0 1.5rem;
		line-height: 1.5;
	}

	.error-details {
		text-align: left;
		margin: 1rem 0;
		padding: 1rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
	}

	.error-details summary {
		cursor: pointer;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.error-stack {
		font-family: 'Courier New', monospace;
		font-size: 0.8rem;
		color: #ef4444;
		overflow-x: auto;
		white-space: pre-wrap;
		margin: 0;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.error-btn {
		padding: 0.75rem 1.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 120px;
	}

	.error-btn:hover {
		border-color: var(--color-primary-red);
	}

	.error-btn.primary {
		background: var(--color-primary-red);
		border-color: var(--color-primary-red);
		color: white;
	}

	.error-btn.primary:hover {
		background: #b91c1c;
		border-color: #b91c1c;
	}

	.error-btn:active {
		transform: translateY(1px);
	}

	@media (max-width: 480px) {
		.error-boundary {
			padding: 1rem;
		}

		.error-card {
			padding: 1.5rem;
		}

		.error-actions {
			flex-direction: column;
		}

		.error-btn {
			width: 100%;
		}
	}
</style>

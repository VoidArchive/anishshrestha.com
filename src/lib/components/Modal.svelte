<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Snippet } from 'svelte';
  
  interface Props {
    title: string;
    isOpen: boolean;
    size?: 'sm' | 'md' | 'lg';
    children: Snippet;
    footer?: Snippet;
  }
  
  let { title, isOpen = $bindable(), size = 'md', children, footer }: Props = $props();
  
  const dispatch = createEventDispatcher();

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  function close() {
    isOpen = false;
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-interactive-supports-focus -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div class="{sizeClasses[size]} w-full bg-bg-secondary border border-border">
      <!-- Header -->
      <div class="border-b border-border p-4">
        <div class="flex items-center justify-between">
          <h2 id="modal-title" class="text-lg font-semibold text-text">
            {title}
          </h2>
          <button
            onclick={close}
            class="text-text-muted hover:text-primary transition-colors duration-200 p-1"
            aria-label="Close modal"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-4">
        {@render children()}
      </div>
      
      <!-- Footer -->
      {#if footer}
        <div class="border-t border-border p-4">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if} 
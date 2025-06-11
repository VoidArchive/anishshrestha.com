<script lang="ts">
  import { Folder, Github, ExternalLink } from 'lucide-svelte';
  export let title: string;
  export let description: string;
  export let tech: string[] = [];
  export let repo: string;
  export let demo: string | null = null;
</script>

<section class="section-card">
  <h2 class="section-title flex items-center gap-2">
    <Folder size={20} class="inline" />
    {title}
  </h2>

  <p class="text-text-secondary mb-4">{description}</p>

  {#if tech.length}
    <div class="flex flex-wrap gap-2 mb-4">
      {#each tech as t}
        <span class="text-xs bg-bg-primary border border-border px-2 py-1">
          {t}
        </span>
      {/each}
    </div>
  {/if}

  <div class="flex gap-3">
    <a
      href={repo}
      target="_blank"
      rel="noopener noreferrer"
      class="btn flex items-center gap-1"
    >
      <Github size={16} /> Code
    </a>

    {#if demo}
      <a
        href={demo}
        target="_blank"
        rel="noopener noreferrer"
        class="btn flex items-center gap-1"
      >
        <ExternalLink size={16} /> Demo
      </a>
    {/if}
  </div>
</section> 
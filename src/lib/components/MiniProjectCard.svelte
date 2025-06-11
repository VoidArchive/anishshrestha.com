<script lang="ts">
  import { Folder, Github } from 'lucide-svelte';
  export let title: string;
  export let description: string;
  export let tech: string[] = [];
  export let repo: string;
</script>

<a
  href={repo}
  target="_blank"
  rel="noopener noreferrer"
  class="block bg-bg-primary border border-border p-4 transition-all duration-300 hover:border-primary-red no-underline"
>
  <article>
    <h3 class="mb-2 flex items-center gap-1">
      <Folder size={16} class="inline text-primary-red" />
      <span class="text-text-primary text-base font-semibold transition-colors duration-300 hover:text-primary-red">
        {title}
      </span>
      <Github size={16} class="ml-auto text-text-secondary" />
    </h3>
    <p class="text-text-secondary text-sm leading-relaxed mb-3 line-clamp-3">{description}</p>
    {#if tech.length}
      <div class="flex gap-1 flex-wrap">
        {#each tech.slice(0, 4) as t}
          <span class="bg-bg-secondary text-white text-xs px-1.5 py-0.5 border border-border">{t}</span>
        {/each}
      </div>
    {/if}
  </article>
</a>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style> 
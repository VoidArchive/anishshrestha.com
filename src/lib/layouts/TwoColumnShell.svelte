<script lang="ts">
  export let leftWidth: string = '280px'; // configurable, but defaults to 280px
  export let leftGap: string = 'gap-6';   // tailwind gap class name
</script>

<div class="grid gap-6 lg:grid-cols-[minmax(0,_var(--left-width))_1fr]" style="--left-width:{leftWidth}">
  <aside class={`flex flex-col ${leftGap}`}>
    <slot name="left" />
  </aside>

  <main class="flex flex-col gap-6 min-w-0">
    <slot />
  </main>
</div> 
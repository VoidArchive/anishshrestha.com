---
title: 'Migrating to SvelteKit 3: What Actually Broke'
slug: 'migrating-to-sveltekit-3'
description: 'The automated migration handles the imports and the config. These are the eight things it did not handle, from a server crash in onDestroy to a pnpm workspace file Cloudflare refused.'
date: '2026-11-04'
published: true
tags: ['sveltekit', 'svelte', 'migration', 'pnpm', 'cloudflare']
---

This site ran on SvelteKit 2.49 until last week. SvelteKit 3.1 was out, along with Svelte 5.57, Vite 8, and TypeScript 6, so I upgraded everything at once. The official migration does most of the work. This post is about the rest.

## What the migration tool does for you

The upgrade starts with the newest 2.x, then one command:

```bash
pnpm dlx sv migrate sveltekit-3 --tasks all
```

It runs twelve tasks. The ones that touched this codebase:

- **`svelte.config.js` is gone.** Everything moves into `vite.config.ts` as options on the `sveltekit()` plugin: `preprocess`, `extensions`, `adapter`. The `vitePlugin` wrapper is removed; its `inspector` option is passed directly.
- **`$lib` becomes `#lib`.** The alias is now a subpath import declared in `package.json`, and every import gets a file extension: `'#lib/utils/blog'` becomes `'#lib/utils/blog.js'`, even for TypeScript files.
- **`$app/environment` becomes `$app/env`.** The tool rewrites it.
- **`tsconfig.json` extends `$app/tsconfig`** instead of a generated file, and you own `include` again.

Type-check, build, 75 tests: all green afterwards. Then the real work began.

## What it does not do

**Custom aliases.** I had `$core` and `$labs` aliases in `kit.alias`. SvelteKit 3 deprecates the option. I replaced them with more subpath imports:

```json
"imports": {
  "#lib": "./src/lib/index.js",
  "#lib/*": "./src/lib/*",
  "#core/*": "./src/core/*",
  "#labs/*": "./src/labs/*"
}
```

The catch is the extension rule. A directory import like `'#labs/bagchal/rules'` has to become `'#labs/bagchal/rules/index.js'`, and a Svelte 5 store module `store.svelte.ts` is imported as `'store.svelte.js'`. Thirty-nine imports, fixed with a script that checked which file existed on disk and appended the right suffix.

**`onDestroy` runs on the server.** My boids canvas removed a resize listener in `onDestroy`. In Svelte 5, `onDestroy` callbacks also run after server rendering, where `window` does not exist. The lab returned a 500 in production. The fix is to return the cleanup from `onMount` instead, which never runs on the server:

```ts
onMount(() => {
	window.addEventListener('resize', handleResize);
	return () => window.removeEventListener('resize', handleResize);
});
```

**An effect that reads and writes the same state.** The Tic Tac Toe lab had an `$effect` that set `isComputerThinking = true`, then reset it to `false` in its cleanup. Svelte 5 runs the effect again when its own write lands, the cleanup writes again, and the page dies with `effect_update_depth_exceeded`. The rule I took away: an effect may read state and schedule work, but the write belongs in the timeout, not in the effect body.

**`lucide-svelte` is deprecated.** The replacement is `@lucide/svelte`, and it dropped the brand icons. GitHub and LinkedIn marks are now two small inline SVG components.

## The pnpm part

pnpm 12 no longer reads the `pnpm` field in `package.json`. Build-script approvals moved to `pnpm-workspace.yaml` under a new key:

```yaml
packages:
  - .

allowBuilds:
  esbuild: true
  sharp: true
  workerd: true
```

The `packages` list matters. My first version left it out, and Cloudflare's build, which runs an older pnpm, failed with `packages field missing or empty`. Pinning `"packageManager": "pnpm@12.16.1"` in `package.json` and adding a `.node-version` of 22 made the hosted build match the local one. SvelteKit 3 needs Node 22.17 or newer, so the Node pin is not optional.

## One warning you can ignore

Every build prints `failed to load language javascript`. It comes from mdsvex, which bundles its own copy of the Prism highlighter but loads grammar files from the newer `prismjs` package you install. The JavaScript grammar calls a helper the bundled core lacks. Highlighting still works, because JavaScript is built into the core. It is noise until mdsvex updates its bundle.

## Was it worth it

Yes. The config lives in one file, the imports are plain Node subpath imports that every tool understands, and the build is faster on Vite 8. Budget half a day, and keep the migration's `MIGRATION_TASKS.md` open until the last item is checked.

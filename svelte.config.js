import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md']
    })
  ],
  kit: {
    adapter: adapter({
      platformProxy: {
        environment: 'dev',
        persist: false,
        configPath: 'wrangler.toml'
      }
    }),
    alias: {
      $core: 'src/core',
      $games: 'src/games'
    }
  },
  extensions: ['.svelte', '.svx', '.md']
};

export default config;

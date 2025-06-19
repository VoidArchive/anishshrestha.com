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
		adapter: adapter(),
		alias: {
			$core: 'src/core',
			$labs: 'src/labs'
		}
	},
	extensions: ['.svelte', '.svx', '.md']
};

export default config;

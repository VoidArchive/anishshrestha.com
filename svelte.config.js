import { escapeSvelte, mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import Prism from 'prismjs/prism.js';
import loadLanguages from 'prismjs/components/index.js';
import 'prism-svelte';

const languages = [
	'bash',
	'css',
	'diff',
	'docker',
	'git',
	'go',
	'html',
	'javascript',
	'json',
	'markdown',
	'python',
	'sh',
	'tsx',
	'typescript',
	'yaml'
];

loadLanguages([...languages], Prism);

const mdsvexConfig = mdsvex({
	extensions: ['.md'],
	highlight: {
		highlighter(code, lang = 'text') {
			const grammar = Prism.languages[lang] ?? Prism.languages.plain;
			const normalisedLang = Prism.languages[lang] ? lang : 'text';
			const highlighted = Prism.highlight(code, grammar, normalisedLang);

			return `{@html \`<pre class="language-${normalisedLang}"><code class="language-${normalisedLang}">${escapeSvelte(highlighted)}</code></pre>\`}`;
		}
	}
});

const config = {
	preprocess: [vitePreprocess(), mdsvexConfig],
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

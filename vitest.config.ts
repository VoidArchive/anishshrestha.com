import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		include: ['src/**/*.test.ts']
	},
	resolve: {
		alias: {
			$core: path.resolve(__dirname, './src/core'),
			$labs: path.resolve(__dirname, './src/labs'),
			$lib: path.resolve(__dirname, './src/lib')
		}
	}
});

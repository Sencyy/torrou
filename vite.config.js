import { defineConfig } from 'vite';

export default defineConfig({
	base: '/2hugame/',
	build: {
		assetsInclude: ['*.html', '*.css', '*.png'],
	},
});

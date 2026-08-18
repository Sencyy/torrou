import { defineConfig } from 'vite';

export default defineConfig({
	base: '/torrou/',
	build: {
		assetsInclude: ['*.html', '*.css', '*.png'],
	},
});

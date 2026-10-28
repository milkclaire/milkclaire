import { defineConfig } from 'oxfmt';

export default defineConfig({
	singleQuote: true,
	sortImports: {
		internalPattern: ['@/', '$/'],
	},
	sortTailwindcss: true,
	useTabs: true,
});

import { createSystem, defaultConfig, defineConfig, defineGlobalStyles } from '@chakra-ui/react';

import { semanticTokens, tokens } from '~/lib/theme/tokens';

const globalCss = defineGlobalStyles({
	'html, body': {
		backgroundColor: 'bg.canvas',
		color: 'text.primary',
		fontFamily: 'body'
	},
	body: {
		minHeight: '100%',
		textRendering: 'optimizeLegibility'
	}
});

const config = defineConfig({
	theme: {
		tokens,
		semanticTokens
	},
	globalCss
});

export const system = createSystem(defaultConfig, config);

'use client';

import MetaPixelProvider from '~/lib/components/analytics/MetaPixelProvider';
import MixpanelProvider from '~/lib/components/analytics/MixpanelProvider';
import { ChakraProvider } from '~/lib/providers/chakra';

export const RootProviders = ({ children }: { children: React.ReactNode }) => (
	<>
		<MetaPixelProvider />
		<MixpanelProvider />
		<ChakraProvider>{children}</ChakraProvider>
	</>
);

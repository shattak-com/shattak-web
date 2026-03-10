'use client';

import MixpanelProvider from '~/lib/components/analytics/MixpanelProvider';
import { ChakraProvider } from '~/lib/providers/chakra';

export const RootProviders = ({ children }: { children: React.ReactNode }) => (
	<>
		<MixpanelProvider />
		<ChakraProvider>{children}</ChakraProvider>
	</>
);

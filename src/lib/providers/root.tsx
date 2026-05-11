'use client';

import MetaPixelProvider from '~/lib/components/analytics/MetaPixelProvider';
import MixpanelProvider from '~/lib/components/analytics/MixpanelProvider';
import GoogleOneTapProvider from '~/lib/components/auth/GoogleOneTapProvider';
import { ChakraProvider } from '~/lib/providers/chakra';

export const RootProviders = ({ children }: { children: React.ReactNode }) => (
	<>
		<MetaPixelProvider />
		<MixpanelProvider />
		<GoogleOneTapProvider />
		<ChakraProvider>{children}</ChakraProvider>
	</>
);

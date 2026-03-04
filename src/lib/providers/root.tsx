'use client';

import AnalyticsConsentBanner from '~/lib/components/analytics/AnalyticsConsentBanner';
import MixpanelProvider from '~/lib/components/analytics/MixpanelProvider';
import { ChakraProvider } from '~/lib/providers/chakra';

export const RootProviders = ({ children }: { children: React.ReactNode }) => (
	<>
		<MixpanelProvider />
		<ChakraProvider>
			{children}
			<AnalyticsConsentBanner />
		</ChakraProvider>
	</>
);

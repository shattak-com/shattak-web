'use client';

import { ChakraProvider } from '~/lib/providers/chakra';

export const RootProviders = ({ children }: { children: React.ReactNode }) => (
	<ChakraProvider>{children}</ChakraProvider>
);

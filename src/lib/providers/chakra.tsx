import { ChakraProvider as BaseChakraProvider } from '@chakra-ui/react';

import { system } from '~/lib/theme';

type ChakraProps = {
	children: React.ReactNode;
};

export const ChakraProvider = ({ children }: ChakraProps) => {
	return <BaseChakraProvider value={system}>{children}</BaseChakraProvider>;
};

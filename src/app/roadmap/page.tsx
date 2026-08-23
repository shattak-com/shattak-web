import { Box } from '@chakra-ui/react';
import type { Metadata } from 'next';

import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';

export const metadata: Metadata = {
	title: 'Roadmap',
	description: 'The Shattak roadmap page is reserved for future updates.',
	robots: {
		index: false,
		follow: true
	}
};

const RoadmapPage = () => (
	<Box minH="100vh" display="flex" flexDirection="column">
		<Header />
		<Box as="main" flex="1" aria-label="Roadmap placeholder" />
		<Footer />
	</Box>
);

export default RoadmapPage;

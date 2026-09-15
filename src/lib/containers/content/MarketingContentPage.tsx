import { Box, Container } from '@chakra-ui/react';

import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';
import MarketingMarkdown from '~/lib/containers/content/MarketingMarkdown';

type MarketingContentPageProps = {
	markdown: string;
};

const MarketingContentPage = ({ markdown }: MarketingContentPageProps) => (
	<>
		<Header />
		<Box as="main" bg="bg.surface" py={{ base: 8, md: 12, lg: 16 }}>
			<Container maxW="4xl">
				<Box
					bg="bg.card"
					border="1px solid"
					borderColor="border.default"
					borderRadius={{ base: 'panel', md: 'card' }}
					boxShadow="soft"
					px={{ base: 5, md: 8, lg: 12 }}
					py={{ base: 7, md: 10, lg: 12 }}
				>
					<MarketingMarkdown markdown={markdown} />
				</Box>
			</Container>
		</Box>
		<Footer />
	</>
);

export default MarketingContentPage;

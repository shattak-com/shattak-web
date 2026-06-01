import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';

import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';

type LegalSection = {
	title: string;
	body: readonly string[];
};

type LegalPageProps = {
	description: string;
	eyebrow: string;
	lastUpdated: string;
	sections: readonly LegalSection[];
	title: string;
};

const LegalPage = ({ description, eyebrow, lastUpdated, sections, title }: LegalPageProps) => (
	<>
		<Header />
		<Box as="main" bg="bg.surface">
			<Box bg="bg.subtle" borderBottom="1px solid" borderColor="border.muted" py={{ base: 12, md: 16 }}>
				<Container maxW="4xl">
					<Stack gap={4}>
						<Text color="primary" fontSize="sm" fontWeight="semibold" letterSpacing="wider" textTransform="uppercase">
							{eyebrow}
						</Text>
						<Heading as="h1" fontSize={{ base: '3xl', md: '5xl' }} lineHeight="short" letterSpacing="0">
							{title}
						</Heading>
						<Text color="text.muted" fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall" maxW="3xl">
							{description}
						</Text>
						<Text color="text.subtle" fontSize="sm">
							Last updated: {lastUpdated}
						</Text>
					</Stack>
				</Container>
			</Box>

			<Container maxW="4xl" py={{ base: 10, md: 14 }}>
				<Stack gap={5}>
					{sections.map((section, index) => (
						<Box
							key={section.title}
							bg="bg.card"
							border="1px solid"
							borderColor="border.default"
							borderRadius="2xl"
							p={{ base: 5, md: 7 }}
						>
							<Stack gap={3}>
								<Text color="primary" fontSize="sm" fontWeight="semibold">
									{String(index + 1).padStart(2, '0')}
								</Text>
								<Heading as="h2" fontSize={{ base: 'xl', md: '2xl' }} letterSpacing="0">
									{section.title}
								</Heading>
								<Stack gap={3}>
									{section.body.map(paragraph => (
										<Text key={paragraph} color="text.muted" fontSize="sm" lineHeight="tall">
											{paragraph}
										</Text>
									))}
								</Stack>
							</Stack>
						</Box>
					))}
				</Stack>
			</Container>
		</Box>
		<Footer />
	</>
);

export default LegalPage;

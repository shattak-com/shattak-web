'use client';

import { Accordion, Box, Container, Stack, Text } from '@chakra-ui/react';

import type { CourseFaqItem } from '~/lib/containers/course/types';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

type CourseFaqProps = {
	faqs: CourseFaqItem[];
};

const CourseFaq = ({ faqs }: CourseFaqProps) => {
	const defaultValue = faqs.length > 0 ? [faqs[0].id] : [];

	return (
		<Box as="section" py={{ base: 10, md: 14 }} bg="bg.surface">
			<Container maxW="7xl">
				<Stack spacing={6}>
					<SectionHeader title="Frequently Asked Questions" />
					<Accordion.Root multiple collapsible defaultValue={defaultValue}>
						<Stack spacing={3}>
							{faqs.map(item => (
								<Accordion.Item key={item.id} value={item.id}>
									<Box bg="bg.card" borderRadius="soft" border="1px solid" borderColor="border.default" overflow="hidden">
										<Accordion.ItemTrigger
											display="flex"
											alignItems="center"
											justifyContent="space-between"
											w="full"
											px={4}
											py={3}
											_hover={{ bg: 'bg.subtle' }}
										>
											<Text fontWeight="semibold">{item.question}</Text>
											<Accordion.ItemIndicator />
										</Accordion.ItemTrigger>
										<Accordion.ItemContent>
											<Accordion.ItemBody px={4} pb={4}>
												<Text color="text.secondary">{item.answer}</Text>
											</Accordion.ItemBody>
										</Accordion.ItemContent>
									</Box>
								</Accordion.Item>
							))}
						</Stack>
					</Accordion.Root>
				</Stack>
			</Container>
		</Box>
	);
};

export default CourseFaq;

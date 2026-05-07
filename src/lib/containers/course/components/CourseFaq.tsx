'use client';

import { Accordion, Box, Container, Stack, Text } from '@chakra-ui/react';
import type { ElementType } from 'react';

import SectionHeader from '~/lib/containers/course/components/SectionHeader';
import type { CourseFaqItem } from '~/lib/containers/course/types';

type CourseFaqProps = {
	faqs: CourseFaqItem[];
};

const AccordionItem = Accordion.Item as ElementType;
const AccordionItemContent = Accordion.ItemContent as ElementType;
const AccordionItemTrigger = Accordion.ItemTrigger as ElementType;

const CourseFaq = ({ faqs }: CourseFaqProps) => {
	const defaultValue = faqs.length > 0 ? [faqs[0].id] : [];

	return (
		<Box as="section" py={{ base: 10, md: 14 }} bg="bg.surface">
			<Container maxW="7xl">
				<Stack gap={6}>
					<SectionHeader title="Frequently Asked Questions" />
					<Accordion.Root multiple collapsible defaultValue={defaultValue}>
						<Stack gap={3}>
							{faqs.map(item => (
								<AccordionItem key={item.id} value={item.id}>
									<Box
										bg="bg.card"
										borderRadius="soft"
										border="1px solid"
										borderColor="border.default"
										overflow="hidden"
									>
										<AccordionItemTrigger
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
										</AccordionItemTrigger>
										<AccordionItemContent>
											<Accordion.ItemBody px={4} pb={4}>
												<Text color="text.secondary">{item.answer}</Text>
											</Accordion.ItemBody>
										</AccordionItemContent>
									</Box>
								</AccordionItem>
							))}
						</Stack>
					</Accordion.Root>
				</Stack>
			</Container>
		</Box>
	);
};

export default CourseFaq;

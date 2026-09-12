'use client';

import { Accordion, Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import type { ElementType } from 'react';

import type { FaqItem } from '~/lib/constants/platform-faqs';

type FaqSectionProps = {
	faqs: readonly FaqItem[];
	id?: string;
};

const AccordionItem = Accordion.Item as ElementType;
const AccordionItemContent = Accordion.ItemContent as ElementType;
const AccordionItemTrigger = Accordion.ItemTrigger as ElementType;

const FaqSection = ({ faqs, id = 'frequently-asked-questions' }: FaqSectionProps) => {
	if (!faqs.length) {
		return null;
	}

	const headingId = `${id}-title`;

	return (
		<Box as="section" id={id} aria-labelledby={headingId} py={{ base: 10, md: 14 }} bg="bg.surface">
			<Container maxW="7xl">
				<Stack gap={6}>
					<Heading id={headingId} fontSize={{ base: 'xl', md: '2xl' }} lineHeight="title" letterSpacing="subtle">
						Frequently Asked Questions
					</Heading>
					<Accordion.Root multiple collapsible>
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
											alignItems="flex-start"
											justifyContent="space-between"
											gap={3}
											w="full"
											px={{ base: 4, md: 5 }}
											py={4}
											textAlign="left"
											_hover={{ bg: 'bg.subtle' }}
										>
											<Text flex="1" minW={0} fontWeight="semibold" overflowWrap="anywhere">
												{item.question}
											</Text>
											<Box flexShrink={0} mt={0.5}>
												<Accordion.ItemIndicator />
											</Box>
										</AccordionItemTrigger>
										<AccordionItemContent>
											<Accordion.ItemBody px={{ base: 4, md: 5 }} pb={4}>
												<Text color="text.secondary" whiteSpace="pre-line">
													{item.answer}
												</Text>
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

export default FaqSection;

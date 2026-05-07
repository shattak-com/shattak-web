'use client';

import { Accordion, Box, Container, Stack, Text } from '@chakra-ui/react';
import type { ElementType } from 'react';

import { aboutFaqItems } from '~/lib/containers/about/constants';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

const AccordionItem = Accordion.Item as ElementType;
const AccordionItemContent = Accordion.ItemContent as ElementType;
const AccordionItemTrigger = Accordion.ItemTrigger as ElementType;

const AboutFaq = () => (
	<Box as="section" id="about-faq" py={{ base: 12, md: 16 }} bg="bg.surface">
		<Container maxW="6xl">
			<Stack gap={6}>
				<SectionHeader
					title="Frequently asked questions"
					subtitle="Quick answers about live classes, mentor-led learning, and portfolio outcomes."
				/>
				<Accordion.Root multiple collapsible defaultValue={[aboutFaqItems[0]?.id ?? '']}>
					<Stack gap={3}>
						{aboutFaqItems.map(item => (
							<AccordionItem key={item.id} value={item.id}>
								<Box bg="bg.card" borderRadius="soft" border="1px solid" borderColor="border.default" overflow="hidden">
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

export default AboutFaq;

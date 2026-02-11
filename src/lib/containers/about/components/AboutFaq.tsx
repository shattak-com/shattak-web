'use client';

import { Accordion, Box, Container, Stack, Text } from '@chakra-ui/react';

import { aboutFaqItems } from '~/lib/containers/about/constants';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

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

export default AboutFaq;

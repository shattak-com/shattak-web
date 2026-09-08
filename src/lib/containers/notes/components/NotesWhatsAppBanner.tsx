'use client';

import { Box, Button, Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowUpRight, FiBell, FiFileText } from 'react-icons/fi';

import { trackWhatsAppCtaClicked } from '~/lib/analytics/mixpanel';
import { WHATSAPP_GROUP_URL } from '~/lib/constants/contact';

const NotesWhatsAppBanner = () => (
	<Flex
		as="section"
		aria-labelledby="notes-whatsapp-heading"
		bg="bg.success"
		border="1px solid"
		borderColor="green.200"
		borderRadius="panel"
		px={{ base: 5, md: 7 }}
		py={{ base: 5, md: 6 }}
		direction={{ base: 'column', sm: 'row' }}
		align={{ base: 'flex-start', sm: 'center' }}
		justify="space-between"
		gap={5}
		overflow="hidden"
		position="relative"
		_dark={{ borderColor: 'green.800' }}
	>
		<Box position="absolute" right={{ base: -4, md: 28 }} top={-8} opacity={0.08}>
			<Icon as={FaWhatsapp} boxSize="130px" />
		</Box>
		<Flex gap={4} align="center" position="relative">
			<Flex
				boxSize={{ base: 11, md: 12 }}
				borderRadius="full"
				bg="green.500"
				color="white"
				align="center"
				justify="center"
				flexShrink={0}
			>
				<Icon as={FaWhatsapp} boxSize={6} />
			</Flex>
			<Stack gap={0.5}>
				<Heading id="notes-whatsapp-heading" size={{ base: 'md', md: 'lg' }}>
					Get notes updates on WhatsApp
				</Heading>
				<Text fontSize="sm" color="text.secondary">
					New resources, useful PDFs, and community updates in one place.
				</Text>
				<Flex gap={3} color="text.muted" fontSize="xs" pt={1} display={{ base: 'none', md: 'flex' }}>
					<Flex align="center" gap={1}>
						<FiBell /> Instant updates
					</Flex>
					<Flex align="center" gap={1}>
						<FiFileText /> Fresh notes
					</Flex>
				</Flex>
			</Stack>
		</Flex>
		<Button
			asChild
			bg="green.500"
			color="white"
			borderRadius="full"
			px={6}
			flexShrink={0}
			_hover={{ bg: 'green.600', transform: 'translateY(-2px)', boxShadow: 'soft' }}
			transition="all 0.2s ease"
		>
			<Link
				href={WHATSAPP_GROUP_URL}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() =>
					trackWhatsAppCtaClicked({
						location: 'notes_whatsapp',
						destination: 'whatsapp_group',
						label: 'Join WhatsApp'
					})
				}
			>
				Join WhatsApp <FiArrowUpRight />
			</Link>
		</Button>
	</Flex>
);

export default NotesWhatsAppBanner;

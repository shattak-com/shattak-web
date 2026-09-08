'use client';

import { Box, Button, Flex, Heading, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowUpRight, FiBell, FiFileText, FiSend } from 'react-icons/fi';

import { trackWhatsAppCtaClicked } from '~/lib/analytics/mixpanel';
import { WHATSAPP_GROUP_URL } from '~/lib/constants/contact';

const NotesWhatsAppBanner = () => (
	<Flex
		as="section"
		aria-labelledby="notes-whatsapp-heading"
		border="1px solid"
		borderColor="green.200"
		borderRadius={{ base: 'panel', md: 'surface' }}
		minH={{ base: '560px', md: '390px' }}
		px={{ base: 6, sm: 8, md: 12, lg: 16 }}
		py={{ base: 8, md: 10 }}
		direction={{ base: 'column', md: 'row' }}
		align="center"
		justify="space-between"
		gap={{ base: 8, md: 10 }}
		overflow="hidden"
		position="relative"
		background="radial-gradient(circle at 82% 34%, rgba(34, 197, 94, 0.2), transparent 32%), linear-gradient(120deg, #ffffff 0%, #f0fdf4 58%, #dcfce7 100%)"
		_dark={{
			borderColor: 'green.800',
			background:
				'radial-gradient(circle at 82% 34%, rgba(34, 197, 94, 0.2), transparent 35%), linear-gradient(120deg, #111827 0%, #10251c 100%)'
		}}
	>
		<Box
			position="absolute"
			left={-16}
			bottom={-20}
			boxSize="250px"
			borderRadius="full"
			border="2px dotted"
			borderColor="green.200"
			opacity={0.5}
			pointerEvents="none"
		/>

		<Stack position="relative" gap={{ base: 5, md: 6 }} maxW={{ md: '590px' }} flex="1" align="flex-start">
			<Heading
				id="notes-whatsapp-heading"
				as="h2"
				fontSize={{ base: '3xl', sm: '4xl', lg: '5xl' }}
				lineHeight="1.12"
				letterSpacing="tight"
				color="gray.900"
				_dark={{ color: 'gray.50' }}
			>
				Join our{' '}
				<Box as="span" color="green.500">
					WhatsApp group
				</Box>{' '}
				to get updates on notes
			</Heading>

			<SimpleGrid columns={{ base: 1, sm: 3 }} gap={{ base: 3, sm: 5 }} w="100%">
				{[
					{ icon: FiBell, label: 'Instant updates' },
					{ icon: FiFileText, label: 'Notes notifications' },
					{ icon: FiSend, label: 'Never miss an update' }
				].map(item => (
					<HStack key={item.label} gap={2.5} color="gray.800" _dark={{ color: 'gray.200' }}>
						<Flex
							boxSize={9}
							bg="green.100"
							color="green.600"
							borderRadius="full"
							align="center"
							justify="center"
							flexShrink={0}
							_dark={{ bg: 'green.900', color: 'green.300' }}
						>
							<Icon as={item.icon} boxSize={4} />
						</Flex>
						<Text fontSize="sm" fontWeight="semibold" lineHeight="short">
							{item.label}
						</Text>
					</HStack>
				))}
			</SimpleGrid>

			<HStack gap={5} flexWrap="wrap">
				<Button
					asChild
					bg="green.500"
					color="white"
					borderRadius="full"
					size="lg"
					px={7}
					boxShadow="0 10px 26px rgba(34, 197, 94, 0.28)"
					_hover={{ bg: 'green.600', transform: 'translateY(-2px)', boxShadow: '0 14px 32px rgba(34, 197, 94, 0.34)' }}
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
						<FaWhatsapp /> Join Now <FiArrowUpRight />
					</Link>
				</Button>
				<Text color="gray.600" fontWeight="medium" lineHeight="short" _dark={{ color: 'gray.400' }}>
					Stay connected.
					<br />
					Stay ahead.
				</Text>
			</HStack>
		</Stack>

		<Box position="relative" w={{ base: '100%', md: '42%' }} h={{ base: '230px', md: '330px' }} flexShrink={0}>
			<Box
				position="absolute"
				left={{ base: '50%', md: '48%' }}
				top="50%"
				transform="translate(-50%, -50%) rotate(7deg)"
				w={{ base: '150px', md: '205px' }}
				h={{ base: '245px', md: '330px' }}
				bg="gray.950"
				border="5px solid"
				borderColor="gray.700"
				borderRadius="38px"
				boxShadow="0 24px 46px rgba(15, 23, 42, 0.34)"
				p="8px"
			>
				<Flex
					h="100%"
					borderRadius="28px"
					background="linear-gradient(160deg, #dcfce7 0%, #4ade80 100%)"
					align="center"
					justify="center"
					position="relative"
					overflow="hidden"
				>
					<Box
						position="absolute"
						top={0}
						left="50%"
						transform="translateX(-50%)"
						w="70px"
						h="16px"
						bg="gray.950"
						borderBottomRadius="full"
					/>
					<Flex
						boxSize={{ base: 20, md: 28 }}
						borderRadius="full"
						bg="white"
						color="green.500"
						align="center"
						justify="center"
						boxShadow="0 12px 30px rgba(22, 101, 52, 0.25)"
					>
						<Icon as={FaWhatsapp} boxSize={{ base: 12, md: 16 }} />
					</Flex>
				</Flex>
			</Box>

			<Flex
				position="absolute"
				top={{ base: 2, md: 32 }}
				right={{ base: 0, md: -4 }}
				bg="white"
				borderRadius="tile"
				p={{ base: 3, md: 4 }}
				gap={3}
				align="center"
				boxShadow="elevated"
				minW={{ base: '145px', md: '190px' }}
				_dark={{ bg: 'gray.800' }}
			>
				<Flex
					boxSize={9}
					borderRadius="full"
					bg="green.100"
					color="green.600"
					align="center"
					justify="center"
					flexShrink={0}
					_dark={{ bg: 'green.900', color: 'green.300' }}
				>
					<FiBell />
				</Flex>
				<Stack gap={1} flex="1">
					<Box h="6px" bg="gray.300" borderRadius="full" />
					<Box h="6px" w="70%" bg="gray.200" borderRadius="full" _dark={{ bg: 'gray.600' }} />
				</Stack>
			</Flex>

			<Flex
				position="absolute"
				bottom={{ base: 1, md: 35 }}
				right={{ base: 8, md: 4 }}
				bg="white"
				borderRadius="tile"
				p={3}
				gap={2}
				align="center"
				boxShadow="elevated"
				minW="125px"
				_dark={{ bg: 'gray.800' }}
			>
				<Icon as={FiFileText} color="green.500" boxSize={6} />
				<Stack gap={1} flex="1">
					<Box h="5px" bg="gray.300" borderRadius="full" />
					<Box h="5px" w="65%" bg="gray.200" borderRadius="full" _dark={{ bg: 'gray.600' }} />
				</Stack>
			</Flex>

			<Icon
				as={FiSend}
				position="absolute"
				left={{ base: '8%', md: '2%' }}
				bottom={{ base: '22%', md: '26%' }}
				color="green.400"
				boxSize={{ base: 10, md: 14 }}
				transform="rotate(-14deg)"
			/>
		</Box>
	</Flex>
);

export default NotesWhatsAppBanner;

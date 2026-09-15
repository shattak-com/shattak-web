'use client';

import { Badge, Box, Button, Flex, Heading, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiArrowRight, FiCheck, FiDownload, FiEdit3, FiFileText, FiShield, FiUsers } from 'react-icons/fi';

import { trackCtaClicked } from '~/lib/analytics/mixpanel';
import { NOTES_CONTRIBUTOR_FORM_URL } from '~/lib/containers/notes/constants';

const benefits = [
	{ icon: FiFileText, label: 'High Quality', detail: 'Notes & PDFs' },
	{ icon: FiDownload, label: 'Free & Easy', detail: 'Downloads' },
	{ icon: FiUsers, label: 'Verified by', detail: 'Seniors' }
];

const universities = [
	{ short: 'IIT', name: 'IIT Kharagpur', color: 'orange.500' },
	{ short: 'JU', name: 'Jadavpur University', color: 'blue.500' },
	{ short: 'JIS', name: 'JIS University', color: 'purple.500' },
	{ short: 'UEM', name: 'University of Engineering & Management', color: 'red.500' },
	{ short: 'TIU', name: 'Techno India University', color: 'cyan.600' },
	{ short: 'MAK', name: 'MAKAUT', color: 'blue.700' }
];

const stats = [
	{ icon: FiFileText, value: '50K+', label: 'Notes & PDFs' },
	{ icon: FiDownload, value: '1M+', label: 'Downloads' },
	{ icon: FiUsers, value: '100K+', label: 'Happy Students' },
	{ icon: FiShield, value: '100%', label: 'Free to Access' }
];

const NoteSheet = ({
	left,
	top,
	rotation,
	zIndex
}: {
	left: string;
	top: string;
	rotation: string;
	zIndex: number;
}) => (
	<Box
		position="absolute"
		left={left}
		top={top}
		w={{ base: '150px', lg: '205px' }}
		h={{ base: '205px', lg: '275px' }}
		bg="white"
		border="1px solid"
		borderColor="purple.200"
		borderRadius="tile"
		boxShadow="0 18px 40px rgba(91, 33, 182, 0.16)"
		transform={`rotate(${rotation})`}
		zIndex={zIndex}
		p={{ base: 3, lg: 4 }}
		_dark={{ bg: 'gray.800', borderColor: 'purple.700', boxShadow: '0 18px 40px rgba(0, 0, 0, 0.32)' }}
	>
		<HStack gap={2} mb={3}>
			<Flex
				boxSize={6}
				borderRadius="soft"
				bg="purple.100"
				color="purple.600"
				align="center"
				justify="center"
				_dark={{ bg: 'purple.900', color: 'purple.300' }}
			>
				<FiEdit3 />
			</Flex>
			<Box h="6px" w="55%" bg="purple.200" borderRadius="full" _dark={{ bg: 'purple.700' }} />
		</HStack>
		<Stack gap={{ base: 2, lg: 2.5 }}>
			{['88%', '70%', '92%', '62%', '83%', '76%', '48%'].map((width, index) => (
				<Box
					key={width}
					h={{ base: '4px', lg: '5px' }}
					w={width}
					bg={index === 3 ? 'purple.200' : 'gray.200'}
					borderRadius="full"
					_dark={{ bg: index === 3 ? 'purple.700' : 'gray.600' }}
				/>
			))}
		</Stack>
		<SimpleGrid columns={3} gap={2} mt={4}>
			{['concept', 'example', 'formula', 'summary', 'diagram', 'revision'].map((cell, index) => (
				<Box
					key={cell}
					h={{ base: 7, lg: 10 }}
					borderRadius="soft"
					bg={index % 2 ? 'purple.50' : 'gray.50'}
					border="1px solid"
					borderColor="gray.100"
					_dark={{ bg: index % 2 ? 'purple.950' : 'gray.700', borderColor: 'gray.600' }}
				/>
			))}
		</SimpleGrid>
	</Box>
);

const NotesHero = () => (
	<Box
		as="section"
		aria-labelledby="notes-hero-heading"
		border="1px solid"
		borderColor="purple.200"
		borderRadius={{ base: 'panel', md: 'surface' }}
		p={{ base: 6, sm: 8, md: 10, lg: 12 }}
		boxShadow="glow"
		position="relative"
		overflow="hidden"
		background="radial-gradient(circle at 78% 25%, rgba(196, 181, 253, 0.5), transparent 34%), linear-gradient(125deg, #ffffff 0%, #faf7ff 55%, #f3e8ff 100%)"
		_dark={{
			borderColor: 'purple.800',
			background:
				'radial-gradient(circle at 78% 25%, rgba(109, 40, 217, 0.22), transparent 36%), linear-gradient(125deg, #111827 0%, #171426 58%, #21143a 100%)'
		}}
	>
		<Box
			position="absolute"
			inset={0}
			opacity={0.23}
			backgroundImage="radial-gradient(circle, #8b5cf6 1.2px, transparent 1.2px)"
			backgroundSize="22px 22px"
			maskImage="linear-gradient(to right, transparent 0%, black 64%, black 100%)"
			pointerEvents="none"
		/>

		<Flex
			position="relative"
			direction={{ base: 'column', lg: 'row' }}
			align="center"
			justify="space-between"
			gap={{ base: 10, lg: 12 }}
			minH={{ lg: '420px' }}
		>
			<Stack gap={{ base: 5, md: 6 }} maxW={{ lg: '600px' }} align="flex-start" flex="1">
				<Badge
					colorPalette="purple"
					variant="subtle"
					borderRadius="full"
					px={4}
					py={2}
					fontWeight="semibold"
					boxShadow="soft"
				>
					<FiShield /> India&apos;s Most Trusted Notes Platform
				</Badge>

				<Stack gap={4}>
					<Heading
						id="notes-hero-heading"
						as="h1"
						fontSize={{ base: '4xl', sm: '5xl', lg: '6xl' }}
						lineHeight="1.06"
						letterSpacing="tight"
						color="gray.950"
						_dark={{ color: 'gray.50' }}
					>
						Get Class Notes, PDFs, &amp; PYQs from Seniors in{' '}
						<Box as="span" color="purple.600" _dark={{ color: 'purple.300' }}>
							One Place
						</Box>
					</Heading>
					<Text
						color="gray.600"
						fontSize={{ base: 'md', md: 'lg' }}
						lineHeight="body"
						maxW="540px"
						_dark={{ color: 'gray.300' }}
					>
						All branch and semester notes in one place. Find useful study materials from your university and prepare
						smarter.
					</Text>
				</Stack>

				<SimpleGrid columns={{ base: 1, sm: 3 }} gap={3} w="100%">
					{benefits.map(item => (
						<HStack
							key={item.label}
							bg="whiteAlpha.800"
							border="1px solid"
							borderColor="purple.100"
							borderRadius="tile"
							p={3}
							gap={2.5}
							boxShadow="soft"
							_dark={{ bg: 'whiteAlpha.100', borderColor: 'purple.800' }}
						>
							<Flex
								boxSize={9}
								borderRadius="soft"
								bg="purple.100"
								color="purple.600"
								align="center"
								justify="center"
								flexShrink={0}
								_dark={{ bg: 'purple.900', color: 'purple.300' }}
							>
								<Icon as={item.icon} />
							</Flex>
							<Box>
								<Text fontSize="xs" fontWeight="bold" color="text.primary">
									{item.label}
								</Text>
								<Text fontSize="xs" color="text.muted">
									{item.detail}
								</Text>
							</Box>
						</HStack>
					))}
				</SimpleGrid>

				<HStack gap={3} flexWrap="wrap">
					<Button
						asChild
						size="lg"
						px={7}
						borderRadius="tile"
						background="linear-gradient(90deg, #7c3aed, #f05f6f)"
						color="white"
						boxShadow="0 12px 28px rgba(124, 58, 237, 0.25)"
						_hover={{ transform: 'translateY(-2px)', boxShadow: '0 16px 34px rgba(124, 58, 237, 0.32)' }}
						transition="all 0.2s ease"
					>
						<Link
							href="#notes-departments"
							onClick={() =>
								trackCtaClicked({ label: 'Explore Notes', location: 'notes_hero', destination: '#notes-departments' })
							}
						>
							Explore Notes <FiArrowRight />
						</Link>
					</Button>
					<Button
						asChild
						size="lg"
						px={7}
						borderRadius="tile"
						variant="outline"
						bg="bg.card"
						borderColor="border.default"
						_hover={{ bg: 'bg.brand', borderColor: 'border.brandSoft', transform: 'translateY(-2px)' }}
						transition="all 0.2s ease"
					>
						<Link
							href={NOTES_CONTRIBUTOR_FORM_URL}
							target="_blank"
							rel="noopener noreferrer"
							onClick={() =>
								trackCtaClicked({ label: 'Contribute Notes', location: 'notes_hero', destination: 'google_form' })
							}
						>
							Contribute Notes <FiEdit3 />
						</Link>
					</Button>
				</HStack>
			</Stack>

			<Box
				position="relative"
				w={{ base: '100%', lg: '48%' }}
				h={{ base: '300px', sm: '360px', lg: '420px' }}
				flexShrink={0}
			>
				<NoteSheet left="7%" top="18%" rotation="-8deg" zIndex={1} />
				<NoteSheet left="34%" top="5%" rotation="0deg" zIndex={3} />
				<NoteSheet left="60%" top="17%" rotation="8deg" zIndex={2} />
				<HStack
					position="absolute"
					right={{ base: '3%', lg: '1%' }}
					bottom={{ base: '8%', lg: '9%' }}
					zIndex={5}
					bg="purple.600"
					color="white"
					px={4}
					py={2.5}
					borderRadius="full"
					boxShadow="0 12px 25px rgba(91, 33, 182, 0.3)"
					fontWeight="semibold"
				>
					<FiCheck /> Senior Verified
				</HStack>
			</Box>
		</Flex>

		<Box
			position="relative"
			mt={{ base: 8, md: 10 }}
			bg="whiteAlpha.800"
			border="1px solid"
			borderColor="purple.100"
			borderRadius="panel"
			px={{ base: 4, md: 6 }}
			py={5}
			boxShadow="soft"
			_dark={{ bg: 'whiteAlpha.100', borderColor: 'purple.800' }}
		>
			<Text textAlign="center" fontWeight="semibold" color="text.secondary" mb={4}>
				Notes Available for All Major Universities
			</Text>
			<Flex align="center" justify="center" gap={{ base: 3, md: 5 }} flexWrap="wrap">
				{universities.map(university => (
					<Stack
						key={university.short}
						align="center"
						gap={1}
						title={university.name}
						minW={{ base: '52px', md: '68px' }}
					>
						<Flex
							boxSize={{ base: 10, md: 12 }}
							borderRadius="full"
							border="2px solid"
							borderColor={university.color}
							color={university.color}
							bg="bg.card"
							align="center"
							justify="center"
							fontWeight="bold"
							fontSize="xs"
						>
							{university.short}
						</Flex>
						<Text
							fontSize="2xs"
							color="text.muted"
							display={{ base: 'none', md: 'block' }}
							maxW="82px"
							textAlign="center"
							lineClamp={1}
						>
							{university.name}
						</Text>
					</Stack>
				))}
				<Flex
					boxSize={{ base: 11, md: 14 }}
					borderRadius="full"
					border="1px dashed"
					borderColor="purple.300"
					color="purple.600"
					bg="purple.50"
					align="center"
					justify="center"
					direction="column"
					fontWeight="bold"
					fontSize="xs"
					_dark={{ bg: 'purple.950', color: 'purple.300', borderColor: 'purple.700' }}
				>
					+50
					<Text as="span" fontSize="2xs" fontWeight="medium">
						More
					</Text>
				</Flex>
			</Flex>
		</Box>

		<SimpleGrid
			position="relative"
			columns={{ base: 2, md: 4 }}
			mt={6}
			border="1px solid"
			borderColor="purple.100"
			borderRadius="panel"
			overflow="hidden"
			bg="whiteAlpha.600"
			_dark={{ bg: 'whiteAlpha.50', borderColor: 'purple.800' }}
		>
			{stats.map((stat, index) => (
				<HStack
					key={stat.value}
					justify="center"
					gap={3}
					px={4}
					py={5}
					borderRight={{ md: index < stats.length - 1 ? '1px solid' : 'none' }}
					borderBottom={{ base: index < 2 ? '1px solid' : 'none', md: 'none' }}
					borderColor="purple.100"
					_dark={{ borderColor: 'purple.800' }}
				>
					<Icon as={stat.icon} color="purple.600" boxSize={6} _dark={{ color: 'purple.300' }} />
					<Box>
						<Text
							color="purple.600"
							fontWeight="bold"
							fontSize={{ base: 'lg', md: 'xl' }}
							_dark={{ color: 'purple.300' }}
						>
							{stat.value}
						</Text>
						<Text color="text.muted" fontSize="xs">
							{stat.label}
						</Text>
					</Box>
				</HStack>
			))}
		</SimpleGrid>
	</Box>
);

export default NotesHero;

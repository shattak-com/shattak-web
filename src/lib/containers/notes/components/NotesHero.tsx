'use client';

import { Badge, Box, Flex, Heading, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { FiBookOpen, FiFileText, FiFolder, FiUsers } from 'react-icons/fi';

const NotesHero = () => (
	<Box
		as="section"
		bg="bg.card"
		border="1px solid"
		borderColor="border.default"
		borderRadius={{ base: 'panel', md: 'surface' }}
		p={{ base: 6, md: 10 }}
		boxShadow="glow"
		position="relative"
		overflow="hidden"
	>
		<Box
			position="absolute"
			inset="0"
			bg="gradients.ctaSurface"
			opacity={0.6}
			pointerEvents="none"
			_dark={{ bg: 'gradients.ctaSurfaceDark' }}
		/>
		<Flex
			position="relative"
			direction={{ base: 'column', lg: 'row' }}
			align="center"
			justify="space-between"
			gap={{ base: 8, lg: 12 }}
		>
			<Stack gap={5} maxW="620px" align="flex-start">
				<Badge colorPalette="orange" variant="subtle" borderRadius="full" px={3} py={1}>
					Built with notes from students
				</Badge>
				<Stack gap={3}>
					<Heading as="h1" fontSize={{ base: '3xl', md: '5xl' }} lineHeight="title" letterSpacing="tight">
						Get class notes, PDFs, and PYQs from seniors — in one place.
					</Heading>
					<Text color="text.secondary" fontSize={{ base: 'md', md: 'lg' }} lineHeight="body" maxW="2xl">
						Browse by department and subject, then securely open useful resources shared by the Shattak community.
					</Text>
				</Stack>
				<HStack gap={{ base: 3, md: 5 }} flexWrap="wrap" color="text.muted" fontSize="sm">
					<HStack gap={1.5}>
						<FiFolder /> Organized by subject
					</HStack>
					<HStack gap={1.5}>
						<FiUsers /> Community contributed
					</HStack>
				</HStack>
			</Stack>

			<SimpleGrid columns={2} gap={3} w={{ base: '100%', sm: '360px' }} flexShrink={0}>
				{[
					{ icon: FiFileText, title: 'Class Notes', text: 'Clear, useful material', color: 'bg.brand' },
					{ icon: FiBookOpen, title: 'PYQs', text: 'Prepare with context', color: 'bg.accent' },
					{ icon: FiFolder, title: 'Drive Folders', text: 'Collections in one link', color: 'bg.success' },
					{ icon: FiUsers, title: 'Peer Shared', text: 'Made for your course', color: 'purple.50' }
				].map(item => (
					<Stack
						key={item.title}
						bg="bg.card"
						border="1px solid"
						borderColor="border.default"
						borderRadius="tile"
						p={4}
						gap={3}
						boxShadow="soft"
					>
						<Flex boxSize={9} borderRadius="soft" bg={item.color} align="center" justify="center" color="text.brand">
							<Icon as={item.icon} />
						</Flex>
						<Box>
							<Text fontWeight="semibold" fontSize="sm">
								{item.title}
							</Text>
							<Text color="text.muted" fontSize="xs" mt={0.5}>
								{item.text}
							</Text>
						</Box>
					</Stack>
				))}
			</SimpleGrid>
		</Flex>
	</Box>
);

export default NotesHero;

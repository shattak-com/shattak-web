'use client';

import { Box, Button, Flex, Heading, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiArrowUpRight, FiCheckCircle, FiFileText, FiUploadCloud } from 'react-icons/fi';

import { trackCtaClicked } from '~/lib/analytics/mixpanel';
import { NOTES_CONTRIBUTOR_FORM_URL } from '~/lib/containers/notes/constants';

const ContributorBanner = () => (
	<Box
		as="section"
		aria-labelledby="notes-contributor-heading"
		bg="bg.inverse"
		color="text.onDark"
		borderRadius={{ base: 'panel', md: 'card' }}
		p={{ base: 6, md: 8 }}
		position="relative"
		overflow="hidden"
		boxShadow="elevated"
	>
		<Box position="absolute" inset="0" bg="gradients.ctaCoolOrb" pointerEvents="none" opacity={0.7} />
		<Flex position="relative" direction={{ base: 'column', lg: 'row' }} gap={7} justify="space-between">
			<Stack gap={4} maxW="580px" align="flex-start">
				<Text color="brand.300" fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase">
					Build the library
				</Text>
				<Stack gap={2}>
					<Heading id="notes-contributor-heading" size={{ base: 'xl', md: '2xl' }} color="text.onDark">
						Become a contributor.
					</Heading>
					<Text color="text.onDarkMuted" lineHeight="body" maxW="2xl">
						Have class notes, PDFs, PPTs, lab resources, or previous-year questions? Share them and help students learn
						with better material.
					</Text>
				</Stack>
				<Button
					asChild
					bg="primary"
					color="text.inverse"
					borderRadius="full"
					px={6}
					_hover={{ bg: 'primaryHover', transform: 'translateY(-2px)', boxShadow: 'primaryHover' }}
					transition="all 0.2s ease"
				>
					<Link
						href={NOTES_CONTRIBUTOR_FORM_URL}
						target="_blank"
						rel="noopener noreferrer"
						onClick={() =>
							trackCtaClicked({
								label: 'Become a Contributor',
								location: 'notes_contributor',
								destination: 'google_form'
							})
						}
					>
						Become a Contributor <FiArrowUpRight />
					</Link>
				</Button>
			</Stack>

			<SimpleGrid columns={{ base: 1, sm: 2, lg: 1 }} gap={3} minW={{ lg: '330px' }}>
				<HStack bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" borderRadius="tile" p={4} gap={3}>
					<Icon as={FiUploadCloud} color="brand.300" boxSize={5} />
					<Box>
						<Text fontWeight="semibold" fontSize="sm">
							Share your notes
						</Text>
						<Text color="text.onDarkSubtle" fontSize="xs">
							PDF, PPT, PYQ, or folder
						</Text>
					</Box>
				</HStack>
				<HStack bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" borderRadius="tile" p={4} gap={3}>
					<Icon as={FiCheckCircle} color="green.300" boxSize={5} />
					<Box>
						<Text fontWeight="semibold" fontSize="sm">
							Help your classmates
						</Text>
						<Text color="text.onDarkSubtle" fontSize="xs">
							Make useful resources easier to find
						</Text>
					</Box>
					<Icon as={FiFileText} ml="auto" color="whiteAlpha.400" />
				</HStack>
			</SimpleGrid>
		</Flex>
	</Box>
);

export default ContributorBanner;

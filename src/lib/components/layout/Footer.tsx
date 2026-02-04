'use client';

import { Box, Container, Heading, HStack, Icon, Separator, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiInstagram, FiLinkedin, FiTwitter, FiYoutube } from 'react-icons/fi';

import { navLinks } from '~/lib/constants/landing';

const Footer = () => (
	<Box as="footer" bg="bg.footer" color="text.onDark" py={{ base: 12, md: 16 }}>
		<Container maxW="6xl">
			<SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 8, md: 10 }}>
				<Stack spacing={3}>
					<Heading size="md">Shattak</Heading>
					<Text fontSize="sm" color="text.onDarkMuted">
						Learn from Experts. Build What Matters. 
					</Text>
					<HStack spacing={3}>
						<Icon as={FiInstagram} />
						<Icon as={FiLinkedin} />
						<Icon as={FiYoutube} />
						<Icon as={FiTwitter} />
					</HStack>
				</Stack>
				<Stack spacing={3}>
					<Text fontWeight="semibold">Quick Links</Text>
					{navLinks.map(link => (
						<Link key={link.id} href={`#${link.id}`}>
							<Text fontSize="sm" color="text.onDarkMuted">
								{link.label}
							</Text>
						</Link>
					))}
					<Link href="#cta">
						<Text fontSize="sm" color="text.onDarkMuted">
							Join Now
						</Text>
					</Link>
				</Stack>
				<Stack spacing={3}>
					<Text fontWeight="semibold">Contact</Text>
					<Text fontSize="sm" color="text.onDarkMuted">
						hello@shattak.com
					</Text>
					<Text fontSize="sm" color="text.onDarkMuted">
						+91 90000 00000
					</Text>
				</Stack>
			</SimpleGrid>
			<Separator my={8} borderColor="border.onDark" />
			<Text fontSize="sm" color="text.onDarkSubtle" textAlign={{ base: 'left', md: 'center' }}>
				All Copy Right Reserved
			</Text>
		</Container>
	</Box>
);

export default Footer;

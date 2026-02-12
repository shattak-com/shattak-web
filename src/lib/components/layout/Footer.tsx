'use client';

import { Box, Container, Heading, HStack, Icon, Separator, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiInstagram, FiLinkedin, FiTwitter, FiYoutube } from 'react-icons/fi';

import { navLinks } from '~/lib/constants/landing';

const Footer = () => {
	const joinNowUrl = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? '/#whatsapp';
	const isJoinNowExternal = /^https?:\/\//i.test(joinNowUrl);

	return (
		<Box as="footer" bg="bg.footer" color="text.onDark" py={{ base: 12, md: 16 }}>
			<Container maxW="6xl">
				<SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 8, md: 10 }}>
					<Stack spacing={4}>

						<Heading size="md">Shattak</Heading>

						<Text fontSize="sm" color="text.onDarkMuted">
							Learn from Experts. Build What Matters.
						</Text>

						<HStack spacing={3}>
						 <Link
							href="https://www.instagram.com/shattakofficial/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon as={FiInstagram} boxSize={8} cursor="pointer" />
						</Link>

						<Link
							href="https://www.linkedin.com/company/shattak/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon as={FiLinkedin} boxSize={8} cursor="pointer" />
						</Link>

						<Link
							href="https://www.youtube.com/@shattakofficial"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon as={FiYoutube} boxSize={8} cursor="pointer" />
						</Link>

						<Link
							href="https://x.com/shattakofficial"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon as={FiTwitter} boxSize={8} cursor="pointer" />
						</Link>

					  </HStack>
					</Stack>
					<Stack spacing={3}>
						<Text fontWeight="semibold">Quick Links</Text>
						{navLinks.map(link => (
							<Link key={link.id} href={link.href}>
								<Text fontSize="sm" color="text.onDarkMuted">
									{link.label}
								</Text>
							</Link>
						))}
						<Link
							href={joinNowUrl}
							target={isJoinNowExternal ? '_blank' : undefined}
							rel={isJoinNowExternal ? 'noopener noreferrer' : undefined}
						>
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
};

export default Footer;

'use client';

import { Box, Button, Container, Flex, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { trackCtaClicked, trackInstructorCtaClicked } from '~/lib/analytics/mixpanel';
import ThemeToggle from '~/lib/components/ThemeToggle';

const headerLinks = [
	{
		id: 'about',
		label: 'About',
		href: '/about',
		external: false
	},
	{
		id: 'campus-ambassador',
		label: 'Campus Ambassador Program',
		href: 'https://forms.gle/HqTLJG6EcNzgNRcW9',
		external: true
	}
];

const Header = () => {
	return (
		<Box
			as="header"
			position="sticky"
			top="0"
			zIndex="1000"
			bg="bg.header"
			backdropFilter="blur(12px)"
			borderBottom="1px solid"
			borderColor="border.muted"
		>
			<Container maxW="6xl" py={{ base: 3, md: 4 }}>
				<Flex align="center" justify={{ base: 'center', md: 'space-between' }} position="relative">
					<Link href="/" aria-label="Shattak home">
						<Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" letterSpacing="tight" color="text.primary">
							Shattak
						</Text>
					</Link>
					<Box
						display={{ base: 'inline-flex', md: 'none' }}
						position="absolute"
						right="0"
						top="50%"
						transform="translateY(-50%)"
					>
						<ThemeToggle />
					</Box>
					<HStack gap={6} display={{ base: 'none', md: 'flex' }}>
						{headerLinks.map(link => (
							<Link
								key={link.id}
								href={link.href}
								target={link.external ? '_blank' : undefined}
								rel={link.external ? 'noopener noreferrer' : undefined}
								onClick={() =>
									trackCtaClicked({
										label: link.label,
										location: 'header_nav',
										destination: link.href,
										context: link.id
									})
								}
							>
								<Text fontSize="sm" fontWeight="medium" color="text.secondary">
									{link.label}
								</Text>
							</Link>
						))}
						<Button
							asChild
							bg="primary"
							color="text.inverse"
							_hover={{ bg: 'primaryHover' }}
							borderRadius="full"
							px={6}
						>
							<Link
								href="https://forms.gle/yQVwU7FJ9Q5rDHTq7"
								target="_blank"
								rel="noopener noreferrer"
								onClick={() =>
									trackInstructorCtaClicked({
										location: 'header_primary',
										destination: 'https://forms.gle/yQVwU7FJ9Q5rDHTq7',
										context: 'desktop'
									})
								}
							>
								Become an Instructor
							</Link>
						</Button>
						<ThemeToggle />
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
};

export default Header;

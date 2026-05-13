'use client';

import { Box, Button, Container, Flex, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { trackCtaClicked, trackInstructorCtaClicked } from '~/lib/analytics/mixpanel';
import { getCurrentUser, type AuthenticatedUser } from '~/lib/api/auth';
import UserAvatar from '~/lib/components/auth/UserAvatar';
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

const getFirstName = (user: AuthenticatedUser) => {
	const source = user.name.trim() || user.email.trim();
	const firstName = source.split(/\s+/)[0] ?? 'User';

	return firstName.split('@')[0] || 'User';
};

const Header = () => {
	const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
	const [isCheckingUser, setIsCheckingUser] = useState(true);

	useEffect(() => {
		let isMounted = true;

		getCurrentUser()
			.then(result => {
				if (isMounted) {
					setCurrentUser(result.user);
				}
			})
			.catch(() => {
				if (isMounted) {
					setCurrentUser(null);
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsCheckingUser(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const firstName = useMemo(() => (currentUser ? getFirstName(currentUser) : ''), [currentUser]);
	const loginButton = (location: 'header_nav' | 'mobile_header') => (
		<Button
			asChild
			bg="primary"
			color="text.inverse"
			_hover={{ bg: 'primaryHover' }}
			borderRadius="full"
			px={{ base: 5, md: 7 }}
			h={{ base: '36px', md: '40px' }}
			boxShadow="soft"
		>
			<Link
				href="/login"
				onClick={() =>
					trackCtaClicked({
						label: 'Login',
						location,
						destination: '/login',
						context: 'login'
					})
				}
			>
				Login
			</Link>
		</Button>
	);
	const desktopAuthAction = (() => {
		if (isCheckingUser) {
			return (
				<Box
					w="104px"
					h="40px"
					borderRadius="full"
					bg="bg.card"
					border="1px solid"
					borderColor="border.default"
					aria-hidden="true"
				/>
			);
		}

		if (currentUser) {
			return (
				<Link href="/profile" aria-label="Open profile">
					<HStack
						bg="primary"
						color="text.inverse"
						borderRadius="full"
						pl={4}
						pr={2}
						py={1.5}
						gap={3}
						boxShadow="soft"
						maxW="180px"
						_hover={{ bg: 'primaryHover' }}
					>
						<Text fontSize="sm" fontWeight="semibold" lineClamp={1}>
							{firstName}
						</Text>
						<UserAvatar user={currentUser} label={firstName} />
					</HStack>
				</Link>
			);
		}

		return loginButton('header_nav');
	})();
	const mobileAuthAction = (() => {
		if (isCheckingUser) {
			return (
				<Box
					w="76px"
					h="36px"
					borderRadius="full"
					bg="bg.card"
					border="1px solid"
					borderColor="border.default"
					aria-hidden="true"
				/>
			);
		}

		if (currentUser) {
			return (
				<Link href="/profile" aria-label="Open profile">
					<Box bg="primary" borderRadius="full" p="3px" boxShadow="soft" _hover={{ bg: 'primaryHover' }}>
						<UserAvatar user={currentUser} label={firstName} size="34px" />
					</Box>
				</Link>
			);
		}

		return loginButton('mobile_header');
	})();

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
				<Flex align="center" justify="space-between" position="relative">
					<Link href="/" aria-label="Shattak home">
						<Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" letterSpacing="tight" color="text.primary">
							Shattak
						</Text>
					</Link>
					<HStack display={{ base: 'flex', md: 'none' }} gap={3}>
						{mobileAuthAction}
						<ThemeToggle />
					</HStack>
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
						{desktopAuthAction}
						<ThemeToggle />
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
};

export default Header;

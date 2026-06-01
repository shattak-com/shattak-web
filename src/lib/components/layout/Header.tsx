'use client';

import { Box, Button, Container, Flex, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { trackCtaClicked, trackInstructorCtaClicked } from '~/lib/analytics/mixpanel';
import { getCurrentUser, type AuthenticatedUser } from '~/lib/api/auth';
import UserAvatar from '~/lib/components/auth/UserAvatar';
import { SkeletonBlock } from '~/lib/components/feedback/LoadingStates';
import ThemeToggle from '~/lib/components/ThemeToggle';

const instructorFormUrl = 'https://forms.gle/yQVwU7FJ9Q5rDHTq7';

const getFirstName = (user: AuthenticatedUser) => {
	const source = user.name.trim() || user.email.trim();
	const firstName = source.split(/\s+/)[0] ?? 'User';

	return firstName.split('@')[0] || 'User';
};

type AuthLoadingPlaceholderProps = {
	variant: 'desktop' | 'mobile';
};

const AuthLoadingPlaceholder = ({ variant }: AuthLoadingPlaceholderProps) => {
	const isDesktop = variant === 'desktop';

	return (
		<HStack
			role="status"
			aria-label="Checking sign-in status"
			w="100%"
			h={isDesktop ? '40px' : '36px'}
			px={isDesktop ? 2 : 1.5}
			border="1px solid"
			borderColor="border.default"
			borderRadius="full"
			bg="bg.card"
			boxShadow="soft"
			gap={2}
			justify={isDesktop ? 'space-between' : 'center'}
			overflow="hidden"
			flexShrink={0}
			_dark={{ bg: 'gray.900' }}
		>
			<SkeletonBlock h={isDesktop ? '10px' : '9px'} w={isDesktop ? '74px' : '36px'} borderRadius="full" />
			<SkeletonBlock boxSize={isDesktop ? '28px' : '24px'} borderRadius="full" flexShrink={0} />
		</HStack>
	);
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
	const instructorLink = (context: 'desktop' | 'mobile') => (
		<Link
			href={instructorFormUrl}
			target="_blank"
			rel="noopener noreferrer"
			onClick={() =>
				trackInstructorCtaClicked({
					location: context === 'desktop' ? 'header_primary' : 'mobile_header',
					destination: instructorFormUrl,
					context
				})
			}
		>
			<Text fontSize="sm" fontWeight="medium" color="text.secondary" whiteSpace="nowrap">
				Become an Instructor
			</Text>
		</Link>
	);
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
			return <AuthLoadingPlaceholder variant="desktop" />;
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
						w="100%"
						minW={0}
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
			return <AuthLoadingPlaceholder variant="mobile" />;
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
						<Box display={{ base: 'none', sm: 'block' }}>{instructorLink('mobile')}</Box>
						<Flex w="88px" justify="flex-end" align="center" flexShrink={0}>
							{mobileAuthAction}
						</Flex>
						<ThemeToggle />
					</HStack>
					<HStack gap={6} display={{ base: 'none', md: 'flex' }}>
						{instructorLink('desktop')}
						<Flex w="100px" justify="flex-end" align="center" flexShrink={0}>
							{desktopAuthAction}
						</Flex>
						<ThemeToggle />
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
};

export default Header;

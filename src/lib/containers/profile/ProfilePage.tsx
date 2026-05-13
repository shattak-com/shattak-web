'use client';

import { Badge, Box, Button, Container, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { logout, type AuthenticatedUser } from '~/lib/api/auth';
import { getOnboardingStatus, type OnboardingProfile } from '~/lib/api/onboarding';
import UserAvatar from '~/lib/components/auth/UserAvatar';
import { ProfilePageSkeleton } from '~/lib/components/feedback/LoadingStates';
import LearningProfileSection from '~/lib/containers/profile/components/LearningProfileSection';
import { getProtectedUserRouteRedirectPath } from '~/lib/utils/onboarding';

const getDisplayName = (user: AuthenticatedUser) => user.name.trim() || user.email;

const ProfilePage = () => {
	const router = useRouter();
	const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
	const [onboardingProfile, setOnboardingProfile] = useState<OnboardingProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const displayName = useMemo(() => (currentUser ? getDisplayName(currentUser) : ''), [currentUser]);

	useEffect(() => {
		let isMounted = true;

		getOnboardingStatus()
			.then(result => {
				if (isMounted) {
					const redirectPath = getProtectedUserRouteRedirectPath(result.profile);

					if (redirectPath) {
						router.replace(redirectPath);
						return;
					}

					setCurrentUser(result.user);
					setOnboardingProfile(result.profile);
				}
			})
			.catch(() => {
				if (isMounted) {
					setCurrentUser(null);
					setOnboardingProfile(null);
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [router]);

	const handleLogout = useCallback(async () => {
		setIsLoggingOut(true);
		setErrorMessage('');

		try {
			await logout();
			window.google?.accounts.id.disableAutoSelect();
			router.push('/login');
			router.refresh();
		} catch {
			setErrorMessage('Unable to log out. Please try again.');
		} finally {
			setIsLoggingOut(false);
		}
	}, [router]);

	if (isLoading) {
		return <ProfilePageSkeleton />;
	}

	let content: ReactNode;

	if (currentUser) {
		content = (
			<Stack gap={8}>
				<HStack gap={5} align="center">
					<UserAvatar user={currentUser} label={displayName} size="72px" />
					<Box>
						<Heading size="lg">{displayName}</Heading>
						<Text mt={1} color="text.muted">
							{currentUser.email}
						</Text>
					</Box>
				</HStack>

				<Box border="1px solid" borderColor="border.default" borderRadius="card" p={{ base: 5, md: 6 }}>
					<Stack gap={4}>
						<Box>
							<Text fontSize="sm" color="text.muted">
								Account status
							</Text>
							<Badge mt={1}>{currentUser.status}</Badge>
						</Box>
						<Box>
							<Text fontSize="sm" color="text.muted">
								Roles
							</Text>
							<HStack mt={2} gap={2} flexWrap="wrap">
								{currentUser.roles.map(role => (
									<Badge key={role}>{role}</Badge>
								))}
							</HStack>
						</Box>
					</Stack>
				</Box>

				<LearningProfileSection
					profile={onboardingProfile}
					onProfileUpdated={setOnboardingProfile}
					onRefreshRequested={() => router.refresh()}
				/>

				<Stack gap={3} align="flex-start">
					<Button
						bg="primary"
						color="text.inverse"
						_hover={{ bg: 'primaryHover' }}
						borderRadius="full"
						onClick={() => {
							handleLogout().catch(() => undefined);
						}}
						disabled={isLoggingOut}
					>
						{isLoggingOut ? 'Logging out...' : 'Logout'}
					</Button>
					{errorMessage ? (
						<Text color="red.500" fontSize="sm">
							{errorMessage}
						</Text>
					) : null}
				</Stack>
			</Stack>
		);
	} else {
		content = (
			<Stack gap={5}>
				<Heading size="lg">Login required</Heading>
				<Text color="text.muted">Please log in to view your profile.</Text>
				<Button asChild bg="primary" color="text.inverse" borderRadius="full" w="fit-content">
					<Link href="/login">Go to login</Link>
				</Button>
			</Stack>
		);
	}

	return (
		<Container maxW="3xl" py={{ base: 12, md: 16 }}>
			{content}
		</Container>
	);
};

export default ProfilePage;

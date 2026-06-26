'use client';

import { Box, Container, HStack, Image as ChakraImage, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { identifyAuthenticatedMixpanelUser, trackAuthEvent } from '~/lib/analytics/mixpanel';
import type { AuthResult } from '~/lib/api/auth';
import { getOnboardingStatus, type OnboardingStatus } from '~/lib/api/onboarding';
import GoogleLoginButton from '~/lib/components/auth/GoogleLoginButton';
import { AuthPageSkeleton, BlockingProgressOverlay } from '~/lib/components/feedback/LoadingStates';
import Header from '~/lib/components/layout/Header';
import { getOnboardingRedirectPath } from '~/lib/utils/onboarding';
import { writeCachedOnboardingStatus } from '~/lib/utils/onboarding-session';

const LOGIN_PREVIEW_IMAGE_URL =
	'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85';

const getSafeRedirectPath = (value: string | null) => {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/admin')) {
		return null;
	}

	return value;
};

const getRequestedRedirectPath = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	return getSafeRedirectPath(new URLSearchParams(window.location.search).get('redirect'));
};

const LoginPage = () => {
	const router = useRouter();
	const [isCheckingSession, setIsCheckingSession] = useState(true);
	const [loginProgressMessage, setLoginProgressMessage] = useState('');

	const redirectToOnboarding = useCallback(
		(onboardingStatus: OnboardingStatus) => {
			const onboardingRedirectPath = getOnboardingRedirectPath(onboardingStatus.profile);
			const requestedRedirectPath = getRequestedRedirectPath();
			const redirectPath =
				onboardingStatus.profile.nextStep === 'COMPLETE' && requestedRedirectPath
					? requestedRedirectPath
					: onboardingRedirectPath;

			writeCachedOnboardingStatus(onboardingStatus);
			router.replace(redirectPath);
		},
		[router]
	);

	useEffect(() => {
		let isMounted = true;

		const checkSession = async () => {
			try {
				const onboardingStatus = await getOnboardingStatus();
				identifyAuthenticatedMixpanelUser({
					userId: onboardingStatus.user.id,
					email: onboardingStatus.user.email,
					name: onboardingStatus.user.name,
					roles: onboardingStatus.user.roles,
					status: onboardingStatus.user.status,
					authContext: 'user',
					onboardingNextStep: onboardingStatus.profile.nextStep
				});
				trackAuthEvent({
					location: 'auth_student_login',
					eventName: 'Existing Session Detected',
					method: 'session_check',
					authContext: 'user',
					redirectPath: getOnboardingRedirectPath(onboardingStatus.profile),
					onboardingNextStep: onboardingStatus.profile.nextStep,
					roles: onboardingStatus.user.roles
				});
				redirectToOnboarding(onboardingStatus);
			} catch {
				if (isMounted) {
					setIsCheckingSession(false);
				}
			}
		};

		checkSession().catch(() => {
			if (isMounted) {
				setIsCheckingSession(false);
			}
		});

		return () => {
			isMounted = false;
		};
	}, [redirectToOnboarding]);

	const handleSuccess = useCallback(
		async (result: AuthResult) => {
			setLoginProgressMessage('Preparing your learning profile...');

			const onboardingStatus = result.onboardingProfile
				? {
						user: result.user,
						profile: result.onboardingProfile
					}
				: await getOnboardingStatus();

			const redirectPath = getOnboardingRedirectPath(onboardingStatus.profile);
			const requestedRedirectPath = getRequestedRedirectPath();
			const finalRedirectPath =
				onboardingStatus.profile.nextStep === 'COMPLETE' && requestedRedirectPath
					? requestedRedirectPath
					: redirectPath;

			identifyAuthenticatedMixpanelUser({
				userId: onboardingStatus.user.id,
				email: onboardingStatus.user.email,
				name: onboardingStatus.user.name,
				roles: onboardingStatus.user.roles,
				status: onboardingStatus.user.status,
				authContext: 'user',
				onboardingNextStep: onboardingStatus.profile.nextStep
			});
			trackAuthEvent({
				location: 'auth_student_login',
				eventName: 'Google Login Succeeded',
				method: 'google_button',
				authContext: 'user',
				redirectPath: finalRedirectPath,
				onboardingNextStep: onboardingStatus.profile.nextStep,
				hasOnboardingProfile: Boolean(result.onboardingProfile),
				roles: onboardingStatus.user.roles
			});
			setLoginProgressMessage('Taking you to the next step...');
			writeCachedOnboardingStatus(onboardingStatus);
			router.replace(finalRedirectPath);
		},
		[router]
	);

	return (
		<>
			<Header />
			{loginProgressMessage ? (
				<BlockingProgressOverlay title="Login successful" message={loginProgressMessage} />
			) : null}
			<Container maxW="7xl" py={{ base: 8, md: 7, xl: 8 }}>
				{isCheckingSession ? (
					<AuthPageSkeleton />
				) : (
					<Box
						display="grid"
						gridTemplateColumns={{ base: '1fr', lg: '1fr 1.12fr' }}
						gap={{ base: 5, lg: 5 }}
						alignItems="stretch"
						maxW="1220px"
						minH={{ lg: 'min(580px, calc(100vh - 140px))' }}
						mx="auto"
					>
						<Box
							border="1px solid"
							borderColor="border.default"
							borderRadius="2xl"
							bg="bg.card"
							p={{ base: 6, md: 10, xl: 12 }}
							display="flex"
							flexDirection="column"
							justifyContent="center"
							minH={{ base: 'auto', md: '480px', xl: '580px' }}
						>
							<HStack
								display="inline-flex"
								gap={2}
								px={3}
								py={1}
								mb={5}
								borderRadius="full"
								border="1px solid"
								borderColor="primary"
								bg="primary.subtle"
								width="fit-content"
							>
								<Box boxSize="5px" borderRadius="full" bg="primary" />
								<Text fontSize="xs" fontWeight="medium" letterSpacing="wider" color="primary" textTransform="uppercase">
									Student Login
								</Text>
							</HStack>

							<Text
								as="h1"
								fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
								lineHeight="1.1"
								letterSpacing="0"
								fontWeight="bold"
								whiteSpace={{ base: 'normal', sm: 'nowrap' }}
							>
								Welcome to Shattak
							</Text>
							<Text
								mt={4}
								mb={9}
								color="text.muted"
								fontSize={{ base: 'sm', md: 'md' }}
								lineHeight="tall"
								fontWeight="light"
							>
								Sign in to access your courses, track your progress, and continue where you left off.
							</Text>

							<Box h="1px" bg="border.default" mb={9} />
							<Box alignSelf="center" w="320px" maxW="100%">
								<GoogleLoginButton
									context="user"
									onAuthStart={() => {
										trackAuthEvent({
											location: 'auth_student_login',
											eventName: 'Google Login Started',
											method: 'google_button',
											authContext: 'user'
										});
										setLoginProgressMessage('Signing in with Google...');
									}}
									onAuthError={() => {
										trackAuthEvent({
											location: 'auth_student_login',
											eventName: 'Google Login Failed',
											method: 'google_button',
											authContext: 'user',
											errorType: 'google_auth_or_redirect_error'
										});
										setLoginProgressMessage('');
									}}
									onSuccess={handleSuccess}
								/>
							</Box>

							<Text mt={5} fontSize="xs" color="text.subtle" textAlign="center" lineHeight="tall">
								By signing in you agree to our{' '}
								<Link href="/terms">
									<Text as="span" color="primary" _hover={{ textDecoration: 'underline' }}>
										Terms
									</Text>
								</Link>{' '}
								and{' '}
								<Link href="/privacy-policy">
									<Text as="span" color="primary" _hover={{ textDecoration: 'underline' }}>
										Privacy Policy
									</Text>
								</Link>
								.
							</Text>
						</Box>

						<Box
							border="1px solid"
							borderColor="border.default"
							borderRadius="2xl"
							bg="bg.subtle"
							overflow="hidden"
							minH={{ base: '320px', md: '460px', lg: '100%' }}
							position="relative"
						>
							<ChakraImage
								src={LOGIN_PREVIEW_IMAGE_URL}
								alt="Students collaborating during a learning session"
								w="100%"
								h="100%"
								minH={{ base: '320px', md: '460px', xl: '580px' }}
								objectFit="cover"
								objectPosition="center"
							/>
							<Box
								position="absolute"
								inset={0}
								bg="linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.62) 100%)"
								_dark={{
									bg: 'linear-gradient(180deg, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.72) 100%)'
								}}
							/>
							<Stack
								position="absolute"
								left={{ base: 5, md: 7 }}
								right={{ base: 5, md: 7 }}
								bottom={{ base: 5, md: 7 }}
								gap={3}
							>
								<HStack
									gap={2}
									px={3}
									py={1}
									borderRadius="full"
									bg="rgba(255, 255, 255, 0.16)"
									border="1px solid"
									borderColor="rgba(255, 255, 255, 0.28)"
									backdropFilter="blur(12px)"
									width="fit-content"
								>
									<Box boxSize="6px" borderRadius="full" bg="primary" />
									<Text
										fontSize="xs"
										fontWeight="semibold"
										color="white"
										letterSpacing="wider"
										textTransform="uppercase"
									>
										Learning starts here
									</Text>
								</HStack>
								<Text color="white" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" lineHeight="short">
									Build skills with guided sessions and practical projects.
								</Text>
								<Text color="whiteAlpha.800" fontSize="sm" maxW="440px" lineHeight="tall">
									Sign in to continue your learning profile and access upcoming Shattak courses.
								</Text>
							</Stack>
						</Box>
					</Box>
				)}
			</Container>
		</>
	);
};

export default LoginPage;

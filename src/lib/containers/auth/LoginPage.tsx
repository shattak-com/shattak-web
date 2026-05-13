'use client';

import { Box, Container, HStack, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getCurrentUser } from '~/lib/api/auth';
import { getOnboardingStatus } from '~/lib/api/onboarding';
import GoogleLoginButton from '~/lib/components/auth/GoogleLoginButton';
import { AuthPageSkeleton, BlockingProgressOverlay } from '~/lib/components/feedback/LoadingStates';
import Header from '~/lib/components/layout/Header';
import { getOnboardingRedirectPath } from '~/lib/utils/onboarding';

const COURSES = [
	{ marker: 'M', subject: 'Mathematics', chapter: 'Ch. 4 - Calculus', pct: 72 },
	{ marker: 'P', subject: 'Physics', chapter: 'Ch. 2 - Mechanics', pct: 45 }
];

const LoginPage = () => {
	const router = useRouter();
	const [isCheckingSession, setIsCheckingSession] = useState(true);
	const [loginProgressMessage, setLoginProgressMessage] = useState('');

	const redirectToOnboarding = useCallback(async () => {
		const onboardingStatus = await getOnboardingStatus();
		router.replace(getOnboardingRedirectPath(onboardingStatus.profile));
		router.refresh();
	}, [router]);

	useEffect(() => {
		let isMounted = true;

		const checkSession = async () => {
			try {
				await getCurrentUser();
				await redirectToOnboarding();
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

	const handleSuccess = useCallback(async () => {
		setLoginProgressMessage('Preparing your learning profile...');
		const onboardingStatus = await getOnboardingStatus();
		setLoginProgressMessage('Taking you to the next step...');
		router.push(getOnboardingRedirectPath(onboardingStatus.profile));
		router.refresh();
	}, [router]);

	return (
		<>
			<Header />
			{loginProgressMessage ? (
				<BlockingProgressOverlay title="Login successful" message={loginProgressMessage} />
			) : null}
			<Container maxW="6xl" py={{ base: 10, md: 14 }}>
				{isCheckingSession ? (
					<AuthPageSkeleton />
				) : (
					<Box
						display="grid"
						gridTemplateColumns={{ base: '1fr', lg: '0.92fr 1.08fr' }}
						gap={{ base: 4, lg: 4 }}
						alignItems="stretch"
					>
						<Box
							border="1px solid"
							borderColor="border.default"
							borderRadius="2xl"
							bg="bg.card"
							p={{ base: 6, md: 10 }}
							display="flex"
							flexDirection="column"
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
								fontSize={{ base: '3xl', md: '4.5xl' }}
								lineHeight="1.1"
								letterSpacing="0"
								fontWeight="bold"
							>
								Welcome
								<br />
								to Shattak
							</Text>
							<Text mt={3} mb={7} color="text.muted" fontSize="sm" lineHeight="tall" fontWeight="light">
								Sign in to access your courses, track your progress, and continue where you left off.
							</Text>

							<Box h="1px" bg="border.default" mb={7} />
							<Box alignSelf="center" w="320px" maxW="100%">
								<GoogleLoginButton
									context="user"
									onAuthStart={() => setLoginProgressMessage('Signing in with Google...')}
									onAuthError={() => setLoginProgressMessage('')}
									onSuccess={handleSuccess}
								/>
							</Box>

							<Text mt={4} fontSize="xs" color="text.subtle" textAlign="center" lineHeight="tall">
								By signing in you agree to our{' '}
								<Text as="a" color="primary">
									Terms
								</Text>{' '}
								and{' '}
								<Text as="a" color="primary">
									Privacy Policy
								</Text>
								.
							</Text>
						</Box>

						<Box border="1px solid" borderColor="border.default" borderRadius="2xl" bg="bg.subtle" overflow="hidden">
							<Stack gap={4} p={{ base: 5, md: 7 }} h="full">
								<Text
									fontSize="xs"
									fontWeight="medium"
									letterSpacing="wider"
									color="text.subtle"
									textTransform="uppercase"
								>
									Your dashboard
								</Text>

								<Box bg="primary" borderRadius="xl" p={5} position="relative" overflow="hidden">
									<Box
										position="absolute"
										w="180px"
										h="180px"
										borderRadius="full"
										bg="whiteAlpha.100"
										top="-60px"
										right="-40px"
									/>
									<Box display="flex" alignItems="flex-end" justifyContent="space-between">
										<Box>
											<Text fontSize="4xl" fontWeight="bold" color="white" lineHeight="1">
												84%
											</Text>
											<Text fontSize="xs" color="whiteAlpha.700" mt={1} letterSpacing="wide">
												Overall performance
											</Text>
										</Box>
										<Box bg="whiteAlpha.200" borderRadius="lg" px={3} py={1.5}>
											<Text fontSize="xs" color="white" fontWeight="medium">
												+6 this week
											</Text>
										</Box>
									</Box>
								</Box>

								<HStack gap={3}>
									{[
										{ n: '12', l: 'Courses enrolled', pct: 75, color: 'primary' },
										{ n: '6', l: 'Day streak', pct: 40, color: 'orange.400' }
									].map(({ n, l, pct, color }) => (
										<Box
											key={l}
											flex="1"
											bg="bg.card"
											border="1px solid"
											borderColor="border.default"
											borderRadius="xl"
											p={4}
										>
											<Text fontSize="2xl" fontWeight="bold">
												{n}
											</Text>
											<Text fontSize="xs" color="text.muted" mt={0.5}>
												{l}
											</Text>
											<Box mt={3} h="3px" borderRadius="full" bg="border.default">
												<Box h="full" borderRadius="full" bg={color} w={`${pct}%`} />
											</Box>
										</Box>
									))}
								</HStack>

								<Text
									fontSize="xs"
									fontWeight="medium"
									letterSpacing="wider"
									color="text.subtle"
									textTransform="uppercase"
								>
									Continue learning
								</Text>
								<Stack gap={2}>
									{COURSES.map(({ marker, subject, chapter, pct }) => (
										<HStack
											key={subject}
											bg="bg.card"
											border="1px solid"
											borderColor="border.default"
											borderRadius="lg"
											p={3}
											gap={3}
										>
											<Box
												w="32px"
												h="32px"
												borderRadius="md"
												bg="bg.subtle"
												display="flex"
												alignItems="center"
												justifyContent="center"
												fontSize="sm"
												fontWeight="bold"
												flexShrink={0}
											>
												{marker}
											</Box>
											<Box flex="1">
												<Text fontSize="xs" fontWeight="semibold">
													{subject}
												</Text>
												<Text fontSize="xs" color="text.muted">
													{chapter}
												</Text>
											</Box>
											<Text fontSize="xs" fontWeight="medium" color="primary">
												{pct}%
											</Text>
										</HStack>
									))}
								</Stack>

								<HStack mt="auto" pt={2} justify="space-between">
									<HStack gap={1.5}>
										<Box boxSize="6px" borderRadius="full" bg="primary" />
										<Box boxSize="6px" borderRadius="full" bg="border.default" />
										<Box boxSize="6px" borderRadius="full" bg="border.default" />
									</HStack>
									<Text fontSize="xs" color="text.subtle">
										Preview of your workspace
									</Text>
								</HStack>
							</Stack>
						</Box>
					</Box>
				)}
			</Container>
		</>
	);
};

export default LoginPage;

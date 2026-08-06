'use client';

import { Alert, Box, Button, Container, Heading, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { trackOnboardingEvent } from '~/lib/analytics/mixpanel';
import { getOnboardingStatus, submitMobileNumber } from '~/lib/api/onboarding';
import type { OnboardingStatus } from '~/lib/api/onboarding';
import { BlockingProgressOverlay, OnboardingStepSkeleton } from '~/lib/components/feedback/LoadingStates';
import { isEducationProfileComplete } from '~/lib/utils/onboarding';
import { readCachedOnboardingStatus, writeCachedOnboardingStatus } from '~/lib/utils/onboarding-session';

const getNextPathAfterMobile = (profile: Awaited<ReturnType<typeof getOnboardingStatus>>['profile']) =>
	isEducationProfileComplete(profile) ? '/profile' : '/onboarding/education';

const normalizeIndianMobileInput = (value: string) => {
	const digitsOnly = value.replace(/\D/g, '');
	const nationalNumber = digitsOnly.startsWith('91') && digitsOnly.length > 10 ? digitsOnly.slice(2) : digitsOnly;

	return nationalNumber.slice(0, 10);
};

const isValidIndianMobileNumber = (value: string) => /^[6-9]\d{9}$/.test(normalizeIndianMobileInput(value));

const MobileProfileIllustration = () => (
	<Box
		position="relative"
		minH={{ base: '280px', md: '100%' }}
		overflow="hidden"
		borderRadius="xl"
		bg="#ffd52e"
		border="1px solid"
		borderColor="border.default"
		p={{ base: 5, md: 6 }}
	>
		<Box
			position="absolute"
			inset={0}
			opacity={0.45}
			backgroundImage="radial-gradient(#111 1px, transparent 1px)"
			backgroundSize="14px 14px"
		/>
		<Stack position="relative" zIndex={1} gap={5} h="full" justify="space-between">
			<Stack gap={1}>
				<Text fontSize="xs" fontWeight="bold" color="black" textTransform="uppercase">
					Profile setup
				</Text>
				<Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="black" color="black" lineHeight="1">
					Stay in the loop
				</Text>
			</Stack>

			<HStack justify="center" align="end" gap={{ base: 3, md: 5 }}>
				<Box
					w={{ base: '118px', md: '136px' }}
					minH={{ base: '214px', md: '248px' }}
					border="4px solid"
					borderColor="black"
					borderRadius="26px"
					bg="white"
					boxShadow="10px 10px 0 rgba(0, 0, 0, 0.22)"
					p={3}
				>
					<Stack gap={3}>
						<HStack justify="space-between">
							<Box h="8px" w="42px" bg="black" borderRadius="full" />
							<Box h="8px" w="8px" bg="primary" borderRadius="full" />
						</HStack>
						<Box border="2px solid" borderColor="black" borderRadius="lg" p={2}>
							<Text fontSize="10px" fontWeight="bold" color="black">
								Course update
							</Text>
							<Text mt={1} fontSize="9px" color="black">
								Session reminders and profile alerts.
							</Text>
						</Box>
						<HStack gap={2}>
							<Box h="34px" flex="1" border="2px solid" borderColor="black" borderRadius="md" />
							<Box h="34px" flex="1" border="2px solid" borderColor="black" borderRadius="md" bg="#ff6b5f" />
						</HStack>
						<Box h="34px" border="2px solid" borderColor="black" borderRadius="md" bg="#d8f36a" />
					</Stack>
				</Box>

				<Box
					display={{ base: 'none', sm: 'block' }}
					w={{ sm: '126px', md: '150px' }}
					minH={{ sm: '236px', md: '274px' }}
					border="4px solid"
					borderColor="black"
					borderRadius="28px"
					bg="#f6f6f0"
					boxShadow="10px 10px 0 rgba(0, 0, 0, 0.18)"
					p={3}
				>
					<Stack gap={3}>
						<HStack justify="space-between">
							<Box h="8px" w="44px" bg="black" borderRadius="full" />
							<Box h="8px" w="8px" bg="black" borderRadius="full" />
						</HStack>
						{['Live class', 'Assignment', 'Certificate', 'Mentor note'].map((label, index) => (
							<HStack key={label} gap={2} border="2px solid" borderColor="black" borderRadius="lg" p={2} bg="white">
								<Box h="20px" w="20px" borderRadius="full" bg={index === 0 ? 'primary' : '#d8f36a'} />
								<Text fontSize="9px" fontWeight="bold" color="black">
									{label}
								</Text>
							</HStack>
						))}
					</Stack>
				</Box>
			</HStack>
		</Stack>
	</Box>
);

const MobileNumberPage = () => {
	const router = useRouter();
	const hasTrackedStepViewRef = useRef(false);
	const [mobileNumber, setMobileNumber] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const applyOnboardingStatus = useCallback(
		(status: OnboardingStatus) => {
			if (status.profile.mobileNumberE164) {
				const redirectPath = getNextPathAfterMobile(status.profile);

				trackOnboardingEvent({
					location: 'onboarding_mobile',
					eventName: 'Step Skipped By Existing Data',
					redirectPath,
					nextStep: status.profile.nextStep,
					hasMobileNumber: true
				});
				router.replace(redirectPath);
				return true;
			}

			setIsLoading(false);

			if (!hasTrackedStepViewRef.current) {
				hasTrackedStepViewRef.current = true;
				trackOnboardingEvent({
					location: 'onboarding_mobile',
					eventName: 'Step Viewed',
					nextStep: status.profile.nextStep,
					hasMobileNumber: false
				});
			}

			return false;
		},
		[router]
	);

	useEffect(() => {
		let isMounted = true;
		const cachedStatus = readCachedOnboardingStatus();

		if (cachedStatus) {
			applyOnboardingStatus(cachedStatus);
		}

		getOnboardingStatus()
			.then(status => {
				if (!isMounted) {
					return;
				}

				writeCachedOnboardingStatus(status);
				applyOnboardingStatus(status);
			})
			.catch(() => {
				router.replace('/login');
			});

		return () => {
			isMounted = false;
		};
	}, [applyOnboardingStatus, router]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage('');
		const normalizedMobileNumber = normalizeIndianMobileInput(mobileNumber);

		if (!isValidIndianMobileNumber(normalizedMobileNumber)) {
			setErrorMessage('Enter a valid 10-digit Indian mobile number.');
			trackOnboardingEvent({
				location: 'onboarding_mobile',
				eventName: 'Mobile Submit Failed',
				errorType: 'client_validation',
				validationField: 'mobile_number'
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const status = await submitMobileNumber(normalizedMobileNumber, 'IN');
			const redirectPath = getNextPathAfterMobile(status.profile);

			writeCachedOnboardingStatus(status);
			trackOnboardingEvent({
				location: 'onboarding_mobile',
				eventName: 'Mobile Number Submitted',
				redirectPath,
				nextStep: status.profile.nextStep,
				hasMobileNumber: true
			});
			router.replace(redirectPath);
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Unable to save mobile number.');
			trackOnboardingEvent({
				location: 'onboarding_mobile',
				eventName: 'Mobile Submit Failed',
				errorType: 'api_error',
				validationField: 'mobile_number'
			});
			setIsSubmitting(false);
		}
	};

	return (
		<>
			{isSubmitting ? (
				<BlockingProgressOverlay
					title="Saving your profile"
					message="Please wait while we update your onboarding step."
				/>
			) : null}
			<Container maxW="6xl" py={{ base: 8, md: 12 }}>
				{isLoading ? (
					<OnboardingStepSkeleton />
				) : (
					<form onSubmit={handleSubmit}>
						<SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 5, lg: 8 }} alignItems="stretch">
							<Box
								border="1px solid"
								borderColor="border.default"
								borderRadius="2xl"
								bg="bg.card"
								p={{ base: 5, md: 7 }}
							>
								<Stack gap={6} h="full" justify="center">
									<Stack gap={4}>
										<Text fontSize="sm" fontWeight="bold" color="primary">
											Step 1 of 2
										</Text>
										<Heading size="xl" lineHeight="short">
											Add your mobile number
										</Heading>
										<Text color="text.muted" lineHeight="relaxed" maxW="md">
											This keeps your learning profile complete and helps us send the right course updates at the right
											time.
										</Text>
									</Stack>

									<Box h="1px" bg="border.default" />

									<Stack gap={2}>
										<Text fontSize="sm" color="text.muted">
											Mobile number
										</Text>
										<HStack gap={3}>
											<Input value="+91" readOnly w="86px" aria-label="Country code" />
											<Input
												type="tel"
												value={mobileNumber}
												onChange={event => setMobileNumber(normalizeIndianMobileInput(event.target.value))}
												placeholder="9876543210"
												autoComplete="tel"
												inputMode="tel"
												maxLength={10}
											/>
										</HStack>
										<Text fontSize="xs" color="text.muted">
											A valid mobile number is required to continue.
										</Text>
									</Stack>

									{errorMessage ? (
										<Alert.Root status="error" borderRadius="md">
											<Alert.Indicator />
											<Alert.Content>
												<Alert.Title>{errorMessage}</Alert.Title>
											</Alert.Content>
										</Alert.Root>
									) : null}

									<Button
										type="submit"
										bg="primary"
										color="text.inverse"
										borderRadius="full"
										disabled={isSubmitting}
										w={{ base: 'full', sm: 'fit-content' }}
									>
										{isSubmitting ? 'Saving...' : 'Verify'}
									</Button>
								</Stack>
							</Box>

							<MobileProfileIllustration />
						</SimpleGrid>
					</form>
				)}
			</Container>
		</>
	);
};

export default MobileNumberPage;

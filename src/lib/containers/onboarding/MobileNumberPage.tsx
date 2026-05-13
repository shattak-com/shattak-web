'use client';

import { Alert, Button, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { getOnboardingStatus, skipMobileNumber, submitMobileNumber } from '~/lib/api/onboarding';
import { BlockingProgressOverlay, OnboardingStepSkeleton } from '~/lib/components/feedback/LoadingStates';
import OnboardingFrame from '~/lib/containers/onboarding/components/OnboardingFrame';
import { getPostMobileSkipPath, isEducationProfileComplete } from '~/lib/utils/onboarding';

const getNextPathAfterMobile = (profile: Awaited<ReturnType<typeof getOnboardingStatus>>['profile']) =>
	isEducationProfileComplete(profile) ? '/profile' : '/onboarding/education';

const isValidIndianMobileNumber = (value: string) => {
	const phoneNumber = parsePhoneNumberFromString(value, 'IN');

	return phoneNumber?.isValid() ?? false;
};

const MobileNumberPage = () => {
	const router = useRouter();
	const [mobileNumber, setMobileNumber] = useState('');
	const [mobileSkipCount, setMobileSkipCount] = useState(0);
	const [mobileSkipLimit, setMobileSkipLimit] = useState(5);
	const [canSkipMobile, setCanSkipMobile] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const skipText = useMemo(
		() => `${mobileSkipCount} of ${mobileSkipLimit} skips used`,
		[mobileSkipCount, mobileSkipLimit]
	);

	useEffect(() => {
		let isMounted = true;

		getOnboardingStatus()
			.then(status => {
				if (!isMounted) {
					return;
				}

				if (status.profile.mobileNumberE164) {
					router.replace(getNextPathAfterMobile(status.profile));
					return;
				}

				setMobileSkipCount(status.profile.mobileSkipCount);
				setMobileSkipLimit(status.profile.mobileSkipLimit);
				setCanSkipMobile(status.profile.canSkipMobile);
			})
			.catch(() => {
				router.replace('/login');
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

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage('');

		if (!isValidIndianMobileNumber(mobileNumber)) {
			setErrorMessage('Enter a valid mobile number.');
			return;
		}

		setIsSubmitting(true);

		try {
			const status = await submitMobileNumber(mobileNumber, 'IN');
			router.push(getNextPathAfterMobile(status.profile));
			router.refresh();
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Unable to save mobile number.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSkip = useCallback(async () => {
		setIsSubmitting(true);
		setErrorMessage('');

		try {
			const status = await skipMobileNumber();
			router.push(getPostMobileSkipPath(status.profile));
			router.refresh();
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Unable to skip this step.');
			setCanSkipMobile(false);
		} finally {
			setIsSubmitting(false);
		}
	}, [router]);

	return (
		<>
			{isSubmitting ? (
				<BlockingProgressOverlay
					title="Saving your profile"
					message="Please wait while we update your onboarding step."
				/>
			) : null}
			<OnboardingFrame
				eyebrow="Step 1 of 2"
				title="Add your mobile number"
				description="This helps us keep your learning profile complete. You can skip this during initial setup until the configured limit is reached."
			>
				{isLoading ? (
					<OnboardingStepSkeleton />
				) : (
					<form onSubmit={handleSubmit}>
						<Stack gap={5}>
							<Stack gap={2}>
								<Text fontSize="sm" color="text.muted">
									Mobile number
								</Text>
								<HStack gap={3}>
									<Input value="+91" readOnly w="86px" aria-label="Country code" />
									<Input
										type="tel"
										value={mobileNumber}
										onChange={event => setMobileNumber(event.target.value)}
										placeholder="9876543210"
										autoComplete="tel"
										inputMode="tel"
									/>
								</HStack>
							</Stack>

							<Text fontSize="sm" color={canSkipMobile ? 'text.muted' : 'red.500'}>
								{canSkipMobile ? skipText : 'A valid mobile number is required to continue.'}
							</Text>

							{errorMessage ? (
								<Alert.Root status="error" borderRadius="md">
									<Alert.Indicator />
									<Alert.Content>
										<Alert.Title>{errorMessage}</Alert.Title>
									</Alert.Content>
								</Alert.Root>
							) : null}

							<HStack gap={3} flexWrap="wrap">
								<Button type="submit" bg="primary" color="text.inverse" borderRadius="full" disabled={isSubmitting}>
									{isSubmitting ? 'Saving...' : 'Continue'}
								</Button>
								{canSkipMobile ? (
									<Button
										type="button"
										variant="outline"
										borderRadius="full"
										disabled={isSubmitting}
										onClick={() => {
											handleSkip().catch(() => undefined);
										}}
									>
										Skip for now
									</Button>
								) : null}
							</HStack>
						</Stack>
					</form>
				)}
			</OnboardingFrame>
		</>
	);
};

export default MobileNumberPage;

'use client';

import { Alert, Box, Button, Input, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { trackOnboardingEvent } from '~/lib/analytics/mixpanel';
import { getOnboardingStatus, submitEducationProfile } from '~/lib/api/onboarding';
import type { OnboardingStatus } from '~/lib/api/onboarding';
import { BlockingProgressOverlay, OnboardingStepSkeleton } from '~/lib/components/feedback/LoadingStates';
import { collegeOptions, departmentOptions, interestOptions } from '~/lib/constants/onboarding';
import InterestSelector from '~/lib/containers/onboarding/components/InterestSelector';
import OnboardingFrame from '~/lib/containers/onboarding/components/OnboardingFrame';
import SearchableSelect from '~/lib/containers/onboarding/components/SearchableSelect';
import { hasMobileGateAccess, isEducationProfileComplete } from '~/lib/utils/onboarding';
import { readCachedOnboardingStatus, writeCachedOnboardingStatus } from '~/lib/utils/onboarding-session';
import { getPassoutYearValidationMessage } from '~/lib/utils/passout-year';

const maxInterestCount = 5;

const hasOption = (options: readonly string[], value: string) =>
	options.some(option => option.toLowerCase() === value.trim().toLowerCase());

const EducationPage = () => {
	const router = useRouter();
	const hasTrackedStepViewRef = useRef(false);
	const [college, setCollege] = useState('');
	const [department, setDepartment] = useState('');
	const [passoutYear, setPassoutYear] = useState('');
	const [interests, setInterests] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const applyOnboardingStatus = useCallback(
		(status: OnboardingStatus) => {
			if (!status.profile.mobileNumberE164 && status.profile.mobileSkipCount === 0) {
				router.replace('/onboarding/mobile');
				return true;
			}

			if (!hasMobileGateAccess(status.profile)) {
				router.replace('/onboarding/mobile');
				return true;
			}

			if (status.profile.mobileNumberE164 && isEducationProfileComplete(status.profile)) {
				router.replace('/profile');
				return true;
			}

			setCollege(status.profile.college ?? '');
			setDepartment(status.profile.department ?? '');
			setPassoutYear(status.profile.passoutYear ?? '');
			setInterests(status.profile.interests);
			setIsLoading(false);

			if (!hasTrackedStepViewRef.current) {
				hasTrackedStepViewRef.current = true;
				trackOnboardingEvent({
					location: 'onboarding_education',
					eventName: 'Step Viewed',
					nextStep: status.profile.nextStep,
					hasMobileNumber: Boolean(status.profile.mobileNumberE164),
					hasCollege: Boolean(status.profile.college),
					hasDepartment: Boolean(status.profile.department),
					hasPassoutYear: Boolean(status.profile.passoutYear),
					interestsCount: status.profile.interests.length,
					mobileSkipCount: status.profile.mobileSkipCount,
					mobileSkipLimit: status.profile.mobileSkipLimit
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

		if (!hasOption(collegeOptions, college)) {
			setErrorMessage('Select a college from the list.');
			trackOnboardingEvent({
				location: 'onboarding_education',
				eventName: 'Education Submit Failed',
				errorType: 'client_validation',
				validationField: 'college',
				hasCollege: false,
				hasDepartment: Boolean(department),
				hasPassoutYear: Boolean(passoutYear),
				interestsCount: interests.length
			});
			return;
		}

		if (!hasOption(departmentOptions, department)) {
			setErrorMessage('Select a department from the list.');
			trackOnboardingEvent({
				location: 'onboarding_education',
				eventName: 'Education Submit Failed',
				errorType: 'client_validation',
				validationField: 'department',
				hasCollege: true,
				hasDepartment: false,
				hasPassoutYear: Boolean(passoutYear),
				interestsCount: interests.length
			});
			return;
		}

		const passoutYearError = getPassoutYearValidationMessage(passoutYear);

		if (passoutYearError) {
			setErrorMessage(passoutYearError);
			trackOnboardingEvent({
				location: 'onboarding_education',
				eventName: 'Education Submit Failed',
				errorType: 'client_validation',
				validationField: 'passout_year',
				hasCollege: true,
				hasDepartment: true,
				hasPassoutYear: Boolean(passoutYear),
				interestsCount: interests.length
			});
			return;
		}

		if (interests.length < 1) {
			setErrorMessage('Select at least one interest.');
			trackOnboardingEvent({
				location: 'onboarding_education',
				eventName: 'Education Submit Failed',
				errorType: 'client_validation',
				validationField: 'interests',
				hasCollege: true,
				hasDepartment: true,
				hasPassoutYear: true,
				interestsCount: interests.length
			});
			return;
		}

		if (interests.length > maxInterestCount) {
			setErrorMessage(`Select up to ${maxInterestCount} interests.`);
			trackOnboardingEvent({
				location: 'onboarding_education',
				eventName: 'Education Submit Failed',
				errorType: 'client_validation',
				validationField: 'interests',
				hasCollege: true,
				hasDepartment: true,
				hasPassoutYear: true,
				interestsCount: interests.length
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const status = await submitEducationProfile(college.trim(), department.trim(), passoutYear.trim(), interests);
			writeCachedOnboardingStatus(status);
			trackOnboardingEvent({
				location: 'onboarding_education',
				eventName: 'Education Profile Submitted',
				redirectPath: '/profile',
				nextStep: status.profile.nextStep,
				hasMobileNumber: Boolean(status.profile.mobileNumberE164),
				hasCollege: Boolean(status.profile.college),
				hasDepartment: Boolean(status.profile.department),
				hasPassoutYear: Boolean(status.profile.passoutYear),
				interestsCount: status.profile.interests.length
			});
			router.replace('/profile');
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Unable to save education details.');
			trackOnboardingEvent({
				location: 'onboarding_education',
				eventName: 'Education Submit Failed',
				errorType: 'api_error',
				hasCollege: Boolean(college),
				hasDepartment: Boolean(department),
				hasPassoutYear: Boolean(passoutYear),
				interestsCount: interests.length
			});
			setIsSubmitting(false);
		}
	};

	return (
		<>
			{isSubmitting ? (
				<BlockingProgressOverlay title="Finishing setup" message="Please wait while we save your learning profile." />
			) : null}
			<OnboardingFrame
				eyebrow="Step 2 of 2"
				title="Tell us what you want to learn"
				description="Choose your college, department, and interests so future course, mentor, and campus experiences can be tailored around your profile."
			>
				{isLoading ? (
					<OnboardingStepSkeleton />
				) : (
					<form onSubmit={handleSubmit}>
						<Stack gap={6}>
							<SearchableSelect
								label="College"
								value={college}
								options={collegeOptions}
								placeholder="Search college"
								onChange={setCollege}
							/>
							<SearchableSelect
								label="Department"
								value={department}
								options={departmentOptions}
								placeholder="Search department"
								onChange={setDepartment}
							/>
							<Box>
								<Text fontSize="sm" mb={2} color="text.muted">
									Passout year
								</Text>
								<Input
									type="text"
									value={passoutYear}
									onChange={event => setPassoutYear(event.target.value)}
									placeholder="2027"
									autoComplete="off"
									inputMode="numeric"
									maxLength={4}
								/>
							</Box>
							<InterestSelector
								options={interestOptions}
								selectedInterests={interests}
								maxInterests={maxInterestCount}
								onChange={setInterests}
							/>

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
								w="fit-content"
								px={6}
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Saving...' : 'Finish setup'}
							</Button>
						</Stack>
					</form>
				)}
			</OnboardingFrame>
		</>
	);
};

export default EducationPage;

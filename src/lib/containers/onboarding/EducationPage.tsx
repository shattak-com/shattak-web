'use client';

import { Alert, Button, Stack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { getOnboardingStatus, submitEducationProfile } from '~/lib/api/onboarding';
import type { OnboardingStatus } from '~/lib/api/onboarding';
import { BlockingProgressOverlay, OnboardingStepSkeleton } from '~/lib/components/feedback/LoadingStates';
import { collegeOptions, departmentOptions, interestOptions } from '~/lib/constants/onboarding';
import InterestSelector from '~/lib/containers/onboarding/components/InterestSelector';
import OnboardingFrame from '~/lib/containers/onboarding/components/OnboardingFrame';
import SearchableSelect from '~/lib/containers/onboarding/components/SearchableSelect';
import { hasMobileGateAccess, isEducationProfileComplete } from '~/lib/utils/onboarding';
import { readCachedOnboardingStatus, writeCachedOnboardingStatus } from '~/lib/utils/onboarding-session';

const maxInterestCount = 5;

const hasOption = (options: readonly string[], value: string) =>
	options.some(option => option.toLowerCase() === value.trim().toLowerCase());

const EducationPage = () => {
	const router = useRouter();
	const [college, setCollege] = useState('');
	const [department, setDepartment] = useState('');
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
			setInterests(status.profile.interests);
			setIsLoading(false);
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
			return;
		}

		if (!hasOption(departmentOptions, department)) {
			setErrorMessage('Select a department from the list.');
			return;
		}

		if (interests.length < 1) {
			setErrorMessage('Select at least one interest.');
			return;
		}

		if (interests.length > maxInterestCount) {
			setErrorMessage(`Select up to ${maxInterestCount} interests.`);
			return;
		}

		setIsSubmitting(true);

		try {
			const status = await submitEducationProfile(college.trim(), department.trim(), interests);
			writeCachedOnboardingStatus(status);
			router.replace('/profile');
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Unable to save education details.');
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

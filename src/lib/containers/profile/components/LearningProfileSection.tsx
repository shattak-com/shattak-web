'use client';

import { Alert, Box, Button, Heading, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { FiEdit3 } from 'react-icons/fi';

import { trackProfileEvent } from '~/lib/analytics/mixpanel';
import { submitEducationProfile, submitMobileNumber, type OnboardingProfile } from '~/lib/api/onboarding';
import { collegeOptions, departmentOptions, interestOptions } from '~/lib/constants/onboarding';
import InterestSelector from '~/lib/containers/onboarding/components/InterestSelector';
import SearchableSelect from '~/lib/containers/onboarding/components/SearchableSelect';
import { getPassoutYearValidationMessage } from '~/lib/utils/passout-year';

const maxInterestCount = 5;

type LearningProfileSectionProps = {
	profile: OnboardingProfile | null;
	onProfileUpdated: (profile: OnboardingProfile) => void;
	onRefreshRequested: () => void;
};

const hasOption = (options: readonly string[], value: string) =>
	options.some(option => option.toLowerCase() === value.trim().toLowerCase());

const getProfileTrackingProperties = (profile: OnboardingProfile | null) => ({
	hasMobileNumber: Boolean(profile?.mobileNumberE164),
	hasCollege: Boolean(profile?.college),
	hasDepartment: Boolean(profile?.department),
	hasPassoutYear: Boolean(profile?.passoutYear),
	interestsCount: profile?.interests.length
});

const LearningProfileDetail = ({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) => (
	<Box
		gridColumn={{ md: wide ? 'span 2' : undefined }}
		border="1px solid"
		borderColor="border.default"
		borderRadius="panel"
		bg="bg.surface"
		p={{ base: 4, md: 5 }}
		minW={0}
	>
		<Text color="text.muted" fontSize="xs" fontWeight="bold" textTransform="uppercase">
			{label}
		</Text>
		<Text mt={2} color="text.primary" fontWeight="semibold" lineHeight="body" overflowWrap="anywhere">
			{value}
		</Text>
	</Box>
);

const LearningProfileSummary = ({ profile }: { profile: OnboardingProfile | null }) => (
	<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
		<LearningProfileDetail label="Mobile" value={profile?.mobileNumberE164 ?? 'Not added yet'} />
		<LearningProfileDetail label="Passout year" value={profile?.passoutYear ?? 'Not added yet'} />
		<LearningProfileDetail label="College" value={profile?.college ?? 'Not selected yet'} />
		<LearningProfileDetail label="Department" value={profile?.department ?? 'Not selected yet'} />
		<LearningProfileDetail
			label="Interests"
			value={profile?.interests.length ? profile.interests.join(', ') : 'Not selected yet'}
			wide
		/>
	</SimpleGrid>
);

const LearningProfileSection = ({ profile, onProfileUpdated, onRefreshRequested }: LearningProfileSectionProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [mobileNumber, setMobileNumber] = useState('');
	const [college, setCollege] = useState('');
	const [department, setDepartment] = useState('');
	const [passoutYear, setPassoutYear] = useState('');
	const [interests, setInterests] = useState<string[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const resetForm = useCallback(() => {
		setMobileNumber(profile?.mobileNumberE164 ?? '');
		setCollege(profile?.college ?? '');
		setDepartment(profile?.department ?? '');
		setPassoutYear(profile?.passoutYear ?? '');
		setInterests(profile?.interests ?? []);
		setErrorMessage('');
	}, [profile]);

	useEffect(() => {
		resetForm();
	}, [resetForm]);

	const handleCancel = useCallback(() => {
		resetForm();
		setIsEditing(false);
	}, [resetForm]);

	const handleSave = useCallback(async () => {
		setErrorMessage('');

		if (!hasOption(collegeOptions, college)) {
			setErrorMessage('Select a college from the list.');
			trackProfileEvent({
				location: 'profile_learning',
				eventName: 'Learning Profile Update Failed',
				errorType: 'client_validation',
				validationField: 'college',
				hasMobileNumber: Boolean(mobileNumber.trim()),
				hasCollege: false,
				hasDepartment: Boolean(department),
				hasPassoutYear: Boolean(passoutYear),
				interestsCount: interests.length
			});
			return;
		}

		if (!hasOption(departmentOptions, department)) {
			setErrorMessage('Select a department from the list.');
			trackProfileEvent({
				location: 'profile_learning',
				eventName: 'Learning Profile Update Failed',
				errorType: 'client_validation',
				validationField: 'department',
				hasMobileNumber: Boolean(mobileNumber.trim()),
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
			trackProfileEvent({
				location: 'profile_learning',
				eventName: 'Learning Profile Update Failed',
				errorType: 'client_validation',
				validationField: 'passout_year',
				hasMobileNumber: Boolean(mobileNumber.trim()),
				hasCollege: true,
				hasDepartment: true,
				hasPassoutYear: Boolean(passoutYear),
				interestsCount: interests.length
			});
			return;
		}

		if (interests.length < 1) {
			setErrorMessage('Select at least one interest.');
			trackProfileEvent({
				location: 'profile_learning',
				eventName: 'Learning Profile Update Failed',
				errorType: 'client_validation',
				validationField: 'interests',
				hasMobileNumber: Boolean(mobileNumber.trim()),
				hasCollege: true,
				hasDepartment: true,
				hasPassoutYear: true,
				interestsCount: interests.length
			});
			return;
		}

		if (interests.length > maxInterestCount) {
			setErrorMessage(`Select up to ${maxInterestCount} interests.`);
			trackProfileEvent({
				location: 'profile_learning',
				eventName: 'Learning Profile Update Failed',
				errorType: 'client_validation',
				validationField: 'interests',
				hasMobileNumber: Boolean(mobileNumber.trim()),
				hasCollege: true,
				hasDepartment: true,
				hasPassoutYear: true,
				interestsCount: interests.length
			});
			return;
		}

		setIsSaving(true);
		trackProfileEvent({
			location: 'profile_learning',
			eventName: 'Learning Profile Update Started',
			hasMobileNumber: Boolean(mobileNumber.trim()),
			hasCollege: Boolean(college),
			hasDepartment: Boolean(department),
			hasPassoutYear: Boolean(passoutYear),
			interestsCount: interests.length
		});

		try {
			if (mobileNumber.trim()) {
				await submitMobileNumber(mobileNumber.trim(), 'IN');
			}

			const updatedStatus = await submitEducationProfile(
				college.trim(),
				department.trim(),
				passoutYear.trim(),
				interests
			);
			onProfileUpdated(updatedStatus.profile);
			setIsEditing(false);
			onRefreshRequested();
			trackProfileEvent({
				location: 'profile_learning',
				eventName: 'Learning Profile Update Succeeded',
				hasMobileNumber: Boolean(updatedStatus.profile.mobileNumberE164),
				hasCollege: Boolean(updatedStatus.profile.college),
				hasDepartment: Boolean(updatedStatus.profile.department),
				hasPassoutYear: Boolean(updatedStatus.profile.passoutYear),
				interestsCount: updatedStatus.profile.interests.length
			});
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Unable to update profile.');
			trackProfileEvent({
				location: 'profile_learning',
				eventName: 'Learning Profile Update Failed',
				errorType: 'api_error',
				hasMobileNumber: Boolean(mobileNumber.trim()),
				hasCollege: Boolean(college),
				hasDepartment: Boolean(department),
				hasPassoutYear: Boolean(passoutYear),
				interestsCount: interests.length
			});
		} finally {
			setIsSaving(false);
		}
	}, [college, department, interests, mobileNumber, onProfileUpdated, onRefreshRequested, passoutYear]);

	return (
		<Box
			as="section"
			aria-labelledby="learning-profile-title"
			border="1px solid"
			borderColor="border.default"
			borderRadius="surface"
			bg="bg.card"
			p={{ base: 5, md: 7 }}
		>
			<Stack gap={6}>
				<HStack justify="space-between" align="flex-start" gap={4}>
					<Box>
						<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
							About you
						</Text>
						<Heading id="learning-profile-title" mt={2} size={{ base: 'lg', md: 'xl' }}>
							Learning profile
						</Heading>
						<Text mt={2} color="text.muted" fontSize="sm" lineHeight="body">
							Keep your education and learning interests accurate for a more relevant experience.
						</Text>
					</Box>
					{isEditing ? null : (
						<Button
							minH="44px"
							variant="outline"
							borderRadius="full"
							flexShrink={0}
							onClick={() => {
								trackProfileEvent({
									location: 'profile_learning',
									eventName: 'Learning Profile Edit Started',
									...getProfileTrackingProperties(profile)
								});
								setIsEditing(true);
							}}
						>
							<FiEdit3 />
							Edit
						</Button>
					)}
				</HStack>

				{isEditing ? (
					<Stack gap={5}>
						<Box>
							<Text id="profile-mobile-number-label" fontSize="sm" mb={2} color="text.muted" fontWeight="semibold">
								Mobile
							</Text>
							<Input
								id="profile-mobile-number"
								aria-labelledby="profile-mobile-number-label"
								type="tel"
								value={mobileNumber}
								onChange={event => setMobileNumber(event.target.value)}
								placeholder="9876543210"
								autoComplete="tel"
								inputMode="tel"
							/>
						</Box>
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
							<Text id="profile-passout-year-label" fontSize="sm" mb={2} color="text.muted" fontWeight="semibold">
								Passout year
							</Text>
							<Input
								id="profile-passout-year"
								aria-labelledby="profile-passout-year-label"
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
						<HStack gap={3} flexWrap="wrap" justify={{ sm: 'flex-end' }}>
							<Button
								minH="44px"
								bg="primary"
								color="text.inverse"
								borderRadius="full"
								disabled={isSaving}
								onClick={() => {
									handleSave().catch(() => undefined);
								}}
							>
								{isSaving ? 'Saving...' : 'Save changes'}
							</Button>
							<Button minH="44px" variant="outline" borderRadius="full" disabled={isSaving} onClick={handleCancel}>
								Cancel
							</Button>
						</HStack>
					</Stack>
				) : (
					<LearningProfileSummary profile={profile} />
				)}
			</Stack>
		</Box>
	);
};

export default LearningProfileSection;

'use client';

import { Alert, Box, Button, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

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

const LearningProfileSummary = ({ profile }: { profile: OnboardingProfile | null }) => (
	<Stack gap={4}>
		<Box>
			<Text fontSize="sm" color="text.muted">
				Mobile
			</Text>
			<Text mt={1}>{profile?.mobileNumberE164 ?? 'Not added yet'}</Text>
		</Box>
		<Box>
			<Text fontSize="sm" color="text.muted">
				College
			</Text>
			<Text mt={1}>{profile?.college ?? 'Not selected yet'}</Text>
		</Box>
		<Box>
			<Text fontSize="sm" color="text.muted">
				Department
			</Text>
			<Text mt={1}>{profile?.department ?? 'Not selected yet'}</Text>
		</Box>
		<Box>
			<Text fontSize="sm" color="text.muted">
				Passout year
			</Text>
			<Text mt={1}>{profile?.passoutYear ?? 'Not added yet'}</Text>
		</Box>
		<Box>
			<Text fontSize="sm" color="text.muted">
				Interests
			</Text>
			<Text mt={1}>{profile?.interests.length ? profile.interests.join(', ') : 'Not selected yet'}</Text>
		</Box>
	</Stack>
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
		<Box border="1px solid" borderColor="border.default" borderRadius="card" p={{ base: 5, md: 6 }}>
			<Stack gap={5}>
				<HStack justify="space-between" align="center" gap={4}>
					<Heading size="md">Learning profile</Heading>
					{isEditing ? null : (
						<Button
							size="sm"
							variant="outline"
							borderRadius="full"
							onClick={() => {
								trackProfileEvent({
									location: 'profile_learning',
									eventName: 'Learning Profile Edit Started',
									...getProfileTrackingProperties(profile)
								});
								setIsEditing(true);
							}}
						>
							Edit
						</Button>
					)}
				</HStack>

				{isEditing ? (
					<Stack gap={5}>
						<Box>
							<Text fontSize="sm" mb={2} color="text.muted">
								Mobile
							</Text>
							<Input
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
						<HStack gap={3} flexWrap="wrap">
							<Button
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
							<Button variant="outline" borderRadius="full" disabled={isSaving} onClick={handleCancel}>
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

'use client';

import { Alert, Box, Button, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

import { submitEducationProfile, submitMobileNumber, type OnboardingProfile } from '~/lib/api/onboarding';
import { collegeOptions, departmentOptions, interestOptions } from '~/lib/constants/onboarding';
import InterestSelector from '~/lib/containers/onboarding/components/InterestSelector';
import SearchableSelect from '~/lib/containers/onboarding/components/SearchableSelect';

const maxInterestCount = 5;

type LearningProfileSectionProps = {
	profile: OnboardingProfile | null;
	onProfileUpdated: (profile: OnboardingProfile) => void;
	onRefreshRequested: () => void;
};

const hasOption = (options: readonly string[], value: string) =>
	options.some(option => option.toLowerCase() === value.trim().toLowerCase());

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
	const [interests, setInterests] = useState<string[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const resetForm = useCallback(() => {
		setMobileNumber(profile?.mobileNumberE164 ?? '');
		setCollege(profile?.college ?? '');
		setDepartment(profile?.department ?? '');
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

		setIsSaving(true);

		try {
			if (mobileNumber.trim()) {
				await submitMobileNumber(mobileNumber.trim(), 'IN');
			}

			const updatedStatus = await submitEducationProfile(college.trim(), department.trim(), interests);
			onProfileUpdated(updatedStatus.profile);
			setIsEditing(false);
			onRefreshRequested();
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Unable to update profile.');
		} finally {
			setIsSaving(false);
		}
	}, [college, department, interests, mobileNumber, onProfileUpdated, onRefreshRequested]);

	return (
		<Box border="1px solid" borderColor="border.default" borderRadius="card" p={{ base: 5, md: 6 }}>
			<Stack gap={5}>
				<HStack justify="space-between" align="center" gap={4}>
					<Heading size="md">Learning profile</Heading>
					{isEditing ? null : (
						<Button size="sm" variant="outline" borderRadius="full" onClick={() => setIsEditing(true)}>
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

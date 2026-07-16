import { Badge, Box, HStack, Stack, Table, Text } from '@chakra-ui/react';
import { FiClock, FiUsers } from 'react-icons/fi';

import type { AdminCourseEnrollment, AdminEnrollmentCourseSummary } from '~/lib/api/admin-enrollments';
import { SkeletonBlock } from '~/lib/components/feedback/LoadingStates';
import {
	formatEnrollmentDateTime,
	getEnrollmentUserInitials,
	getEnrollmentUserName
} from '~/lib/containers/admin/enrollments/utils';

type EnrollmentLearnerPanelProps = {
	enrollments: AdminCourseEnrollment[];
	errorMessage: string;
	isLoading: boolean;
	selectedCourse: AdminEnrollmentCourseSummary | null;
};

const getStatusPalette = (status: AdminCourseEnrollment['status']) => {
	if (status === 'COMPLETED') {
		return 'blue';
	}

	if (status === 'CANCELLED') {
		return 'red';
	}

	return 'green';
};

const LearnerAvatar = ({ enrollment }: { enrollment: AdminCourseEnrollment }) => (
	<Box
		boxSize="40px"
		borderRadius="full"
		bg="bg.brand"
		backgroundImage={enrollment.user.avatarUrl ? `url(${enrollment.user.avatarUrl})` : undefined}
		backgroundSize="cover"
		backgroundPosition="center"
		display="grid"
		placeItems="center"
		fontSize="xs"
		fontWeight="bold"
		color="text.primary"
		flexShrink={0}
		aria-hidden="true"
	>
		{enrollment.user.avatarUrl ? null : getEnrollmentUserInitials(enrollment.user.name, enrollment.user.email)}
	</Box>
);

const ProgressIndicator = ({ value }: { value: number }) => (
	<Stack gap={1} minW="112px">
		<HStack justify="space-between" gap={2}>
			<Text fontSize="xs" color="text.muted">
				Course progress
			</Text>
			<Text fontSize="xs" fontWeight="bold">
				{value}%
			</Text>
		</HStack>
		<Box h="6px" borderRadius="full" bg="bg.subtle" overflow="hidden">
			<Box h="100%" w={`${Math.min(100, Math.max(0, value))}%`} borderRadius="full" bg="primary" />
		</Box>
	</Stack>
);

const LearnerPanelSkeleton = () => (
	<Stack gap={3} p={4}>
		{Array.from({ length: 4 }, (_, index) => (
			<HStack key={index} gap={3} p={3} borderBottom="1px solid" borderColor="border.default">
				<SkeletonBlock boxSize="40px" borderRadius="full" flexShrink={0} />
				<Stack gap={2} flex={1}>
					<SkeletonBlock h="14px" w="36%" />
					<SkeletonBlock h="11px" w="58%" />
				</Stack>
			</HStack>
		))}
	</Stack>
);

const LearnerMobileCard = ({ enrollment }: { enrollment: AdminCourseEnrollment }) => {
	const { profile } = enrollment.user;

	return (
		<Box border="1px solid" borderColor="border.muted" borderRadius="lg" p={4}>
			<Stack gap={4}>
				<HStack gap={3} align="start">
					<LearnerAvatar enrollment={enrollment} />
					<Box minW={0} flex={1}>
						<Text fontWeight="semibold" overflowWrap="anywhere">
							{getEnrollmentUserName(enrollment.user.name, enrollment.user.email)}
						</Text>
						<Text fontSize="xs" color="text.muted" overflowWrap="anywhere">
							{enrollment.user.email}
						</Text>
					</Box>
					<Badge colorPalette={getStatusPalette(enrollment.status)}>{enrollment.status}</Badge>
				</HStack>
				<Stack gap={1} fontSize="sm" color="text.secondary">
					<Text>{profile?.mobileNumberE164 ?? 'No mobile number'}</Text>
					<Text>{[profile?.college, profile?.department].filter(Boolean).join(' / ') || 'No education profile'}</Text>
					<Text>{profile?.passoutYear ? `Passout year: ${profile.passoutYear}` : 'No passout year'}</Text>
				</Stack>
				<ProgressIndicator value={enrollment.progressPercent} />
				<HStack gap={2} color="text.muted" fontSize="xs">
					<FiClock aria-hidden="true" />
					<Text>Enrolled {formatEnrollmentDateTime(enrollment.enrolledAt)}</Text>
				</HStack>
			</Stack>
		</Box>
	);
};

const LearnerTable = ({ enrollments }: { enrollments: AdminCourseEnrollment[] }) => (
	<Box display={{ base: 'none', md: 'block' }} overflowX="auto">
		<Table.Root size="sm" minW="880px">
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeader minW="220px">Learner</Table.ColumnHeader>
					<Table.ColumnHeader minW="280px">Profile</Table.ColumnHeader>
					<Table.ColumnHeader minW="160px">Progress</Table.ColumnHeader>
					<Table.ColumnHeader minW="180px">Activity</Table.ColumnHeader>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{enrollments.map(enrollment => {
					const { profile } = enrollment.user;

					return (
						<Table.Row key={enrollment.id} _hover={{ bg: 'bg.subtle' }}>
							<Table.Cell>
								<HStack gap={3} align="start">
									<LearnerAvatar enrollment={enrollment} />
									<Box minW={0}>
										<Text fontWeight="semibold" overflowWrap="anywhere">
											{getEnrollmentUserName(enrollment.user.name, enrollment.user.email)}
										</Text>
										<Text fontSize="xs" color="text.muted" overflowWrap="anywhere">
											{enrollment.user.email}
										</Text>
									</Box>
								</HStack>
							</Table.Cell>
							<Table.Cell>
								<Stack gap={1} fontSize="xs" color="text.secondary">
									<Text>{profile?.mobileNumberE164 ?? 'No mobile number'}</Text>
									<Text overflowWrap="anywhere">
										{[profile?.college, profile?.department].filter(Boolean).join(' / ') || 'No education profile'}
									</Text>
									<Text>{profile?.passoutYear ? `Passout year: ${profile.passoutYear}` : 'No passout year'}</Text>
								</Stack>
							</Table.Cell>
							<Table.Cell>
								<Stack gap={2}>
									<Badge alignSelf="flex-start" colorPalette={getStatusPalette(enrollment.status)}>
										{enrollment.status}
									</Badge>
									<ProgressIndicator value={enrollment.progressPercent} />
								</Stack>
							</Table.Cell>
							<Table.Cell>
								<Stack gap={1} fontSize="xs">
									<Text>Enrolled {formatEnrollmentDateTime(enrollment.enrolledAt)}</Text>
									<Text color="text.muted">Last active {formatEnrollmentDateTime(enrollment.lastAccessedAt)}</Text>
								</Stack>
							</Table.Cell>
						</Table.Row>
					);
				})}
			</Table.Body>
		</Table.Root>
	</Box>
);

const EnrollmentLearnerPanel = ({
	enrollments,
	errorMessage,
	isLoading,
	selectedCourse
}: EnrollmentLearnerPanelProps) => {
	const content = (() => {
		if (isLoading) {
			return <LearnerPanelSkeleton />;
		}

		if (errorMessage) {
			return (
				<Text p={5} color="red.500">
					{errorMessage}
				</Text>
			);
		}

		if (!selectedCourse) {
			return (
				<Stack align="center" justify="center" gap={3} minH="360px" px={5} py={10} textAlign="center">
					<Box color="icon.brand" fontSize="3xl">
						<FiUsers aria-hidden="true" />
					</Box>
					<Text fontSize="lg" fontWeight="bold">
						Select a course
					</Text>
					<Text maxW="360px" color="text.muted">
						Choose a course from the list to review its enrolled learners, profiles, and progress.
					</Text>
				</Stack>
			);
		}

		if (!enrollments.length) {
			return (
				<Stack align="center" justify="center" gap={2} minH="280px" px={5} py={10} textAlign="center">
					<Text fontWeight="semibold">No enrolled learners yet</Text>
					<Text maxW="360px" fontSize="sm" color="text.muted">
						Enrollment details will appear here when a learner joins this course.
					</Text>
				</Stack>
			);
		}

		return (
			<>
				<Stack display={{ base: 'flex', md: 'none' }} gap={3} p={3}>
					{enrollments.map(enrollment => (
						<LearnerMobileCard key={enrollment.id} enrollment={enrollment} />
					))}
				</Stack>
				<LearnerTable enrollments={enrollments} />
			</>
		);
	})();

	return (
		<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" overflow="hidden" minW={0}>
			<HStack
				justify="space-between"
				align="start"
				gap={4}
				p={4}
				borderBottom="1px solid"
				borderColor="border.default"
				flexWrap="wrap"
			>
				<Box minW={0}>
					<Text fontSize="md" fontWeight="bold" overflowWrap="anywhere">
						{selectedCourse?.title ?? 'Enrolled learners'}
					</Text>
					<Text mt={1} fontSize="xs" color="text.muted">
						{selectedCourse
							? 'Review learner profiles, enrollment state, and current course progress.'
							: 'Course details will appear here after you make a selection.'}
					</Text>
				</Box>
				{selectedCourse ? (
					<HStack gap={2} flexWrap="wrap">
						<Badge colorPalette={selectedCourse.status === 'PUBLISHED' ? 'green' : 'gray'}>
							{selectedCourse.status}
						</Badge>
						<Badge variant="outline" colorPalette="orange">
							{enrollments.length} {enrollments.length === 1 ? 'learner' : 'learners'}
						</Badge>
					</HStack>
				) : null}
			</HStack>
			{content}
		</Box>
	);
};

export default EnrollmentLearnerPanel;

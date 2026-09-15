import { Badge, Box, Button, HStack, Stack, Table, Text } from '@chakra-ui/react';
import { FiClock, FiUsers } from 'react-icons/fi';

import type {
	AdminCourseEnrollment,
	AdminEnrollmentCourseSummary,
	AdminEnrollmentPagination
} from '~/lib/api/admin-enrollments';
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
	onNextPage?: () => void;
	onPreviousPage?: () => void;
	pagination?: AdminEnrollmentPagination;
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

const EnrollmentStatusBadges = ({ enrollment }: { enrollment: AdminCourseEnrollment }) => (
	<HStack gap={2} flexWrap="wrap">
		<Badge colorPalette={getStatusPalette(enrollment.status)}>{enrollment.status}</Badge>
		<Badge variant="outline" colorPalette={enrollment.whatsappVerified ? 'green' : 'gray'}>
			{enrollment.whatsappVerified ? 'WhatsApp joined' : 'WhatsApp pending'}
		</Badge>
	</HStack>
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

const LearnerMobileCard = ({ enrollment, showCourse }: { enrollment: AdminCourseEnrollment; showCourse: boolean }) => {
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
					<EnrollmentStatusBadges enrollment={enrollment} />
				</HStack>
				{showCourse && enrollment.course ? (
					<Box bg="bg.subtle" borderRadius="md" px={3} py={2}>
						<Text fontSize="xs" color="text.muted">
							Course
						</Text>
						<Text mt={0.5} fontSize="sm" fontWeight="semibold">
							{enrollment.course?.title ?? 'Course unavailable'}
						</Text>
					</Box>
				) : null}
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

const LearnerTable = ({ enrollments, showCourse }: { enrollments: AdminCourseEnrollment[]; showCourse: boolean }) => (
	<Box display={{ base: 'none', md: 'block' }} overflowX="auto">
		<Table.Root size="sm" minW={showCourse ? '1080px' : '880px'}>
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeader minW="220px">Learner</Table.ColumnHeader>
					{showCourse ? <Table.ColumnHeader minW="220px">Course</Table.ColumnHeader> : null}
					<Table.ColumnHeader minW="280px">Profile</Table.ColumnHeader>
					<Table.ColumnHeader minW="220px">Progress</Table.ColumnHeader>
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
							{showCourse ? (
								<Table.Cell>
									<Text fontWeight="semibold" overflowWrap="anywhere">
										{enrollment.course?.title ?? 'Course unavailable'}
									</Text>
								</Table.Cell>
							) : null}
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
									<EnrollmentStatusBadges enrollment={enrollment} />
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
	onNextPage,
	onPreviousPage,
	pagination,
	selectedCourse
}: EnrollmentLearnerPanelProps) => {
	const showCourse = !selectedCourse;
	const headerSummary = (() => {
		if (selectedCourse) {
			return (
				<HStack gap={2} flexWrap="wrap">
					<Badge colorPalette={selectedCourse.status === 'PUBLISHED' ? 'green' : 'gray'}>{selectedCourse.status}</Badge>
					<Badge variant="outline" colorPalette="orange">
						{enrollments.length} {enrollments.length === 1 ? 'learner' : 'learners'}
					</Badge>
				</HStack>
			);
		}

		if (pagination) {
			return (
				<Badge variant="outline" colorPalette="orange">
					{pagination.total} {pagination.total === 1 ? 'enrollment' : 'enrollments'}
				</Badge>
			);
		}

		return null;
	})();
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

		if (!enrollments.length) {
			return (
				<Stack align="center" justify="center" gap={2} minH="280px" px={5} py={10} textAlign="center">
					<Box color="icon.brand" fontSize="3xl">
						<FiUsers aria-hidden="true" />
					</Box>
					<Text fontWeight="semibold">{selectedCourse ? 'No enrolled learners yet' : 'No matching enrollments'}</Text>
					<Text maxW="360px" fontSize="sm" color="text.muted">
						{selectedCourse
							? 'Enrollment details will appear here when a learner joins this course.'
							: 'New enrollments across courses will appear here, with the most recent learners first.'}
					</Text>
				</Stack>
			);
		}

		return (
			<>
				<Stack display={{ base: 'flex', md: 'none' }} gap={3} p={3}>
					{enrollments.map(enrollment => (
						<LearnerMobileCard key={enrollment.id} enrollment={enrollment} showCourse={showCourse} />
					))}
				</Stack>
				<LearnerTable enrollments={enrollments} showCourse={showCourse} />
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
						{selectedCourse?.title ?? 'All enrolled learners'}
					</Text>
					<Text mt={1} fontSize="xs" color="text.muted">
						{selectedCourse
							? 'Review learner profiles, enrollment state, and current course progress.'
							: 'Review enrollments across matching courses, ordered with the newest learners first.'}
					</Text>
				</Box>
				{headerSummary}
			</HStack>
			{content}
			{!selectedCourse && pagination && pagination.totalPages > 1 ? (
				<HStack justify="space-between" gap={3} p={3} borderTop="1px solid" borderColor="border.default">
					<Text fontSize="xs" color="text.muted">
						Page {pagination.page} of {pagination.totalPages}
					</Text>
					<HStack gap={2}>
						<Button
							size="xs"
							variant="outline"
							borderRadius="full"
							disabled={!pagination.hasPreviousPage || isLoading}
							onClick={onPreviousPage}
						>
							Previous
						</Button>
						<Button
							size="xs"
							variant="outline"
							borderRadius="full"
							disabled={!pagination.hasNextPage || isLoading}
							onClick={onNextPage}
						>
							Next
						</Button>
					</HStack>
				</HStack>
			) : null}
		</Box>
	);
};

export default EnrollmentLearnerPanel;

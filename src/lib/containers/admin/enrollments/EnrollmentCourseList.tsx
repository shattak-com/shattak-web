import { Box, Button, HStack, Stack, Text, chakra } from '@chakra-ui/react';
import { FiBookOpen, FiCalendar, FiUsers } from 'react-icons/fi';

import type { AdminEnrollmentCourseSummary, AdminEnrollmentPagination } from '~/lib/api/admin-enrollments';
import { SkeletonBlock } from '~/lib/components/feedback/LoadingStates';
import { formatCoursePublishedDate } from '~/lib/containers/admin/enrollments/utils';

type EnrollmentCourseListProps = {
	courses: AdminEnrollmentCourseSummary[];
	isLoading: boolean;
	pagination: AdminEnrollmentPagination;
	selectedCourseId?: string;
	onClearSelection: () => void;
	onNextPage: () => void;
	onPreviousPage: () => void;
	onSelectCourse: (course: AdminEnrollmentCourseSummary) => void;
};

const CourseListSkeleton = () => (
	<Stack gap={2} p={3}>
		{Array.from({ length: 6 }, (_, index) => (
			<HStack key={index} gap={3} p={3} border="1px solid" borderColor="border.default" borderRadius="lg">
				<SkeletonBlock boxSize="48px" borderRadius="md" flexShrink={0} />
				<Stack gap={2} flex={1}>
					<SkeletonBlock h="14px" w="82%" />
					<SkeletonBlock h="11px" w="56%" />
				</Stack>
			</HStack>
		))}
	</Stack>
);

const EmptyCourseList = () => (
	<Stack align="center" gap={2} px={5} py={10} textAlign="center">
		<Box color="icon.brand" fontSize="2xl">
			<FiBookOpen aria-hidden="true" />
		</Box>
		<Text fontWeight="semibold">No courses found</Text>
		<Text maxW="280px" fontSize="sm" color="text.muted">
			Try a different course title or slug.
		</Text>
	</Stack>
);

const CourseSelectionCard = ({
	course,
	isSelected,
	onSelect
}: {
	course: AdminEnrollmentCourseSummary;
	isSelected: boolean;
	onSelect: () => void;
}) => (
	<chakra.button
		type="button"
		aria-pressed={isSelected}
		w="100%"
		p={3}
		textAlign="left"
		border="1px solid"
		borderLeftWidth={isSelected ? '4px' : '1px'}
		borderColor={isSelected ? 'border.brand' : 'border.muted'}
		borderRadius="lg"
		bg={isSelected ? 'bg.subtle' : 'bg.card'}
		color="text.primary"
		transition="border-color 160ms ease, background-color 160ms ease"
		_hover={{ borderColor: 'border.brand', bg: 'bg.subtle' }}
		_focusVisible={{ outline: '2px solid', outlineColor: 'border.brand', outlineOffset: '2px' }}
		onClick={onSelect}
	>
		<HStack gap={3} align="center">
			<Box
				boxSize="56px"
				borderRadius="md"
				bg="bg.subtle"
				backgroundImage={course.thumbnailImage ? `url(${course.thumbnailImage})` : undefined}
				backgroundSize="cover"
				backgroundPosition="center"
				border="1px solid"
				borderColor="border.default"
				flexShrink={0}
				display="grid"
				placeItems="center"
				aria-hidden="true"
			>
				{course.thumbnailImage ? null : <FiBookOpen />}
			</Box>
			<Stack gap={1.5} minW={0} flex={1}>
				<Text fontSize="sm" fontWeight="semibold" lineClamp={2} overflowWrap="anywhere">
					{course.title}
				</Text>
				<HStack gap={3} color="text.muted" flexWrap="wrap">
					<HStack gap={1.5}>
						<FiUsers aria-hidden="true" />
						<Text fontSize="xs">
							{course.enrollmentCount} {course.enrollmentCount === 1 ? 'learner' : 'learners'}
						</Text>
					</HStack>
					<HStack gap={1.5}>
						<FiCalendar aria-hidden="true" />
						<Text fontSize="xs">
							{course.publishedAt ? `Published ${formatCoursePublishedDate(course.publishedAt)}` : 'Not published'}
						</Text>
					</HStack>
				</HStack>
			</Stack>
		</HStack>
	</chakra.button>
);

const CourseListContent = ({
	courses,
	isLoading,
	selectedCourseId,
	onSelectCourse
}: Pick<EnrollmentCourseListProps, 'courses' | 'isLoading' | 'selectedCourseId' | 'onSelectCourse'>) => {
	if (isLoading) {
		return <CourseListSkeleton />;
	}

	if (!courses.length) {
		return <EmptyCourseList />;
	}

	return (
		<Stack
			gap={2}
			p={3}
			h={{ base: '420px', md: '520px', xl: 'calc(100vh - 260px)' }}
			minH={{ base: '420px', md: '520px', xl: '420px' }}
			maxH={{ base: 'none', xl: '760px' }}
			overflowY="auto"
		>
			{courses.map(course => (
				<CourseSelectionCard
					key={course.id}
					course={course}
					isSelected={selectedCourseId === course.id}
					onSelect={() => onSelectCourse(course)}
				/>
			))}
		</Stack>
	);
};

const EnrollmentCourseList = ({
	courses,
	isLoading,
	pagination,
	selectedCourseId,
	onClearSelection,
	onNextPage,
	onPreviousPage,
	onSelectCourse
}: EnrollmentCourseListProps) => (
	<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" overflow="hidden" minW={0}>
		<HStack
			justify="space-between"
			align="start"
			gap={3}
			p={4}
			borderBottom="1px solid"
			borderColor="border.default"
			flexWrap="wrap"
		>
			<Box minW={0}>
				<Text fontSize="md" fontWeight="bold">
					Courses
				</Text>
				<Text mt={1} fontSize="xs" color="text.muted">
					Select a course to focus its learners, or review all enrollments.
				</Text>
			</Box>
			<Stack align="flex-end" gap={2} flexShrink={0}>
				{selectedCourseId ? (
					<Button size="xs" variant="outline" borderRadius="full" onClick={onClearSelection}>
						Show all enrollments
					</Button>
				) : null}
			</Stack>
		</HStack>

		<CourseListContent
			courses={courses}
			isLoading={isLoading}
			selectedCourseId={selectedCourseId}
			onSelectCourse={onSelectCourse}
		/>

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
	</Box>
);

export default EnrollmentCourseList;

'use client';

import { Box, Button, HStack, Stack, Text, useBreakpointValue } from '@chakra-ui/react';
import Link from 'next/link';
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiBookOpen, FiUsers } from 'react-icons/fi';

import { trackAdminEnrollmentEvent } from '~/lib/analytics/mixpanel';
import {
	listAdminCourseEnrollments,
	listAdminEnrollmentCourses,
	type AdminCourseEnrollment,
	type AdminEnrollmentCourseListParams,
	type AdminEnrollmentCourseSummary,
	type AdminEnrollmentPagination
} from '~/lib/api/admin-enrollments';
import EnrollmentCourseFilters, {
	type EnrollmentCourseFilterValues
} from '~/lib/containers/admin/enrollments/EnrollmentCourseFilters';
import EnrollmentCourseList from '~/lib/containers/admin/enrollments/EnrollmentCourseList';
import EnrollmentLearnerDrawer from '~/lib/containers/admin/enrollments/EnrollmentLearnerDrawer';
import EnrollmentLearnerPanel from '~/lib/containers/admin/enrollments/EnrollmentLearnerPanel';

const PAGE_SIZE = 50;

const defaultPagination: AdminEnrollmentPagination = {
	page: 1,
	pageSize: PAGE_SIZE,
	total: 0,
	totalPages: 1,
	hasNextPage: false,
	hasPreviousPage: false
};

const createDefaultFilters = (): EnrollmentCourseFilterValues => ({
	q: '',
	status: 'PUBLISHED',
	categories: [],
	level: '',
	mode: '',
	sortBy: 'enrollmentCount',
	sortOrder: 'desc'
});

const AdminEnrollmentsPage = () => {
	const [courses, setCourses] = useState<AdminEnrollmentCourseSummary[]>([]);
	const [pagination, setPagination] = useState(defaultPagination);
	const [filters, setFilters] = useState<EnrollmentCourseFilterValues>(createDefaultFilters);
	const [appliedFilters, setAppliedFilters] = useState<EnrollmentCourseFilterValues>(createDefaultFilters);
	const [page, setPage] = useState(1);
	const [selectedCourse, setSelectedCourse] = useState<AdminEnrollmentCourseSummary | null>(null);
	const [selectedEnrollments, setSelectedEnrollments] = useState<AdminCourseEnrollment[]>([]);
	const [isLoadingCourses, setIsLoadingCourses] = useState(true);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);
	const [message, setMessage] = useState('');
	const [detailsMessage, setDetailsMessage] = useState('');
	const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
	const courseRequestId = useRef(0);
	const detailsRequestId = useRef(0);
	const isDesktopWorkspace = useBreakpointValue({ base: false, xl: true }) ?? false;

	const enrollmentCountOnPage = useMemo(
		() => courses.reduce((total, course) => total + course.enrollmentCount, 0),
		[courses]
	);
	const appliedFilterCount = useMemo(
		() =>
			[
				appliedFilters.q,
				appliedFilters.status,
				appliedFilters.categories.length ? appliedFilters.categories : '',
				appliedFilters.level,
				appliedFilters.mode
			].filter(Boolean).length,
		[appliedFilters]
	);

	const clearSelectedCourse = useCallback(() => {
		detailsRequestId.current += 1;
		setSelectedCourse(null);
		setSelectedEnrollments([]);
		setDetailsMessage('');
		setIsLoadingDetails(false);
		setIsMobileDetailsOpen(false);
	}, []);

	const loadCourses = useCallback(async () => {
		const requestId = courseRequestId.current + 1;
		courseRequestId.current = requestId;
		setIsLoadingCourses(true);
		setMessage('');

		try {
			const params: AdminEnrollmentCourseListParams = {
				...appliedFilters,
				page,
				pageSize: PAGE_SIZE
			};
			const result = await listAdminEnrollmentCourses(params);

			if (courseRequestId.current !== requestId) {
				return;
			}

			setCourses(result.courses);
			setPagination(result.pagination);
			trackAdminEnrollmentEvent({
				eventName: 'Course Enrollment Counts Viewed',
				enrollmentCount: result.courses.reduce((total, course) => total + course.enrollmentCount, 0),
				sourcePage: '/admin/enrollments'
			});
		} catch {
			if (courseRequestId.current === requestId) {
				setMessage('Unable to load course enrollment counts.');
			}
		} finally {
			if (courseRequestId.current === requestId) {
				setIsLoadingCourses(false);
			}
		}
	}, [appliedFilters, page]);

	useEffect(() => {
		loadCourses().catch(() => undefined);
	}, [loadCourses]);

	useEffect(() => {
		if (isDesktopWorkspace) {
			setIsMobileDetailsOpen(false);
		}
	}, [isDesktopWorkspace]);

	const loadCourseEnrollments = useCallback(
		async (course: AdminEnrollmentCourseSummary) => {
			const requestId = detailsRequestId.current + 1;
			detailsRequestId.current = requestId;
			setSelectedCourse(course);
			setSelectedEnrollments([]);
			setIsLoadingDetails(true);
			setDetailsMessage('');
			setIsMobileDetailsOpen(!isDesktopWorkspace);

			try {
				const result = await listAdminCourseEnrollments(course.id);

				if (detailsRequestId.current !== requestId) {
					return;
				}

				setSelectedEnrollments(result.enrollments);
				trackAdminEnrollmentEvent({
					eventName: 'Course Enrollment Details Viewed',
					courseId: course.slug,
					courseTitle: course.title,
					enrollmentCount: result.enrollments.length,
					sourcePage: '/admin/enrollments'
				});
			} catch {
				if (detailsRequestId.current === requestId) {
					setDetailsMessage('Unable to load enrolled users for this course.');
					setSelectedEnrollments([]);
				}
			} finally {
				if (detailsRequestId.current === requestId) {
					setIsLoadingDetails(false);
				}
			}
		},
		[isDesktopWorkspace]
	);

	const applyFilters = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		clearSelectedCourse();
		setPage(1);
		setAppliedFilters({
			...filters,
			q: filters.q.trim(),
			categories: [...filters.categories]
		});
	};

	const resetFilters = () => {
		const defaults = createDefaultFilters();
		setFilters(defaults);
		clearSelectedCourse();
		setPage(1);
		setAppliedFilters({ ...defaults, categories: [] });
	};

	const changePage = (nextPage: number) => {
		clearSelectedCourse();
		setPage(nextPage);
	};
	const closeMobileDetails = useCallback(() => {
		setIsMobileDetailsOpen(false);
	}, []);

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={4}>
				<Stack gap={4}>
					<HStack justify="space-between" gap={3} flexWrap="wrap">
						<Box>
							<Text fontSize="md" fontWeight="bold">
								Course enrollments
							</Text>
							<Text mt={1} fontSize="xs" color="text.muted">
								Filter the course catalog, then review learner enrollment state and progress in one workspace.
							</Text>
						</Box>
						<Button asChild variant="outline" borderRadius="full">
							<Link href="/admin/courses">Manage courses</Link>
						</Button>
					</HStack>
					<EnrollmentCourseFilters
						appliedFilterCount={appliedFilterCount}
						filters={filters}
						isLoading={isLoadingCourses}
						onChange={setFilters}
						onReset={resetFilters}
						onSubmit={applyFilters}
					/>
					{message ? <Text color="red.500">{message}</Text> : null}
				</Stack>
			</Box>

			<Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(3, minmax(0, 1fr))' }} gap={3}>
				<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.card" p={4}>
					<HStack gap={3}>
						<Box color="icon.brand" fontSize="xl">
							<FiBookOpen aria-hidden="true" />
						</Box>
						<Box>
							<Text fontSize="xl" fontWeight="bold">
								{pagination.total}
							</Text>
							<Text fontSize="xs" color="text.muted">
								Matching courses
							</Text>
						</Box>
					</HStack>
				</Box>
				<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.card" p={4}>
					<HStack gap={3}>
						<Box color="icon.brand" fontSize="xl">
							<FiUsers aria-hidden="true" />
						</Box>
						<Box>
							<Text fontSize="xl" fontWeight="bold">
								{enrollmentCountOnPage}
							</Text>
							<Text fontSize="xs" color="text.muted">
								Enrollments on this page
							</Text>
						</Box>
					</HStack>
				</Box>
				<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.card" p={4}>
					<Text fontSize="xl" fontWeight="bold">
						{selectedCourse ? selectedEnrollments.length : '—'}
					</Text>
					<Text mt={1} fontSize="xs" color="text.muted" lineClamp={1}>
						{selectedCourse ? `Learners in ${selectedCourse.title}` : 'No course selected'}
					</Text>
				</Box>
			</Box>

			<Box
				display="grid"
				gridTemplateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(320px, 390px) minmax(0, 1fr)' }}
				gap={4}
				alignItems="start"
			>
				<EnrollmentCourseList
					courses={courses}
					isLoading={isLoadingCourses}
					pagination={pagination}
					selectedCourseId={selectedCourse?.id}
					onSelectCourse={course => {
						loadCourseEnrollments(course).catch(() => undefined);
					}}
					onPreviousPage={() => changePage(Math.max(1, page - 1))}
					onNextPage={() => changePage(page + 1)}
				/>
				<Box display={{ base: 'none', xl: 'block' }} minW={0}>
					<EnrollmentLearnerPanel
						enrollments={selectedEnrollments}
						errorMessage={detailsMessage}
						isLoading={isLoadingDetails}
						selectedCourse={selectedCourse}
					/>
				</Box>
			</Box>

			<EnrollmentLearnerDrawer
				enrollments={selectedEnrollments}
				errorMessage={detailsMessage}
				isLoading={isLoadingDetails}
				isOpen={isMobileDetailsOpen && !isDesktopWorkspace}
				onClose={closeMobileDetails}
				selectedCourse={selectedCourse}
			/>
		</Stack>
	);
};

export default AdminEnrollmentsPage;

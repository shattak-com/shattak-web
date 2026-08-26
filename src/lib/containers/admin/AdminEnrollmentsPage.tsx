'use client';

import { Box, Button, HStack, Stack, Text, useBreakpointValue } from '@chakra-ui/react';
import Link from 'next/link';
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiBarChart2, FiBookOpen, FiLayers, FiUsers } from 'react-icons/fi';

import { trackAdminEnrollmentEvent } from '~/lib/analytics/mixpanel';
import {
	listAdminCourseEnrollments,
	listAdminEnrollmentCourses,
	listAdminEnrollments,
	type AdminCourseEnrollment,
	type AdminEnrollmentCourseListParams,
	type AdminEnrollmentCourseSummary,
	type AdminEnrollmentOverviewItem,
	type AdminEnrollmentPagination,
	type AdminEnrollmentStats
} from '~/lib/api/admin-enrollments';
import AdminMetricsGrid from '~/lib/containers/admin/components/AdminMetricsGrid';
import EnrollmentAnalyticsDialog from '~/lib/containers/admin/enrollments/EnrollmentAnalyticsDialog';
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
	const [overviewEnrollments, setOverviewEnrollments] = useState<AdminEnrollmentOverviewItem[]>([]);
	const [overviewPagination, setOverviewPagination] = useState(defaultPagination);
	const [overviewPage, setOverviewPage] = useState(1);
	const [stats, setStats] = useState<AdminEnrollmentStats | null>(null);
	const [isLoadingCourses, setIsLoadingCourses] = useState(true);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);
	const [isLoadingOverview, setIsLoadingOverview] = useState(true);
	const [message, setMessage] = useState('');
	const [detailsMessage, setDetailsMessage] = useState('');
	const [overviewMessage, setOverviewMessage] = useState('');
	const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
	const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
	const courseRequestId = useRef(0);
	const detailsRequestId = useRef(0);
	const overviewRequestId = useRef(0);
	const isDesktopWorkspace = useBreakpointValue({ base: false, xl: true }) ?? false;

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

	const loadEnrollmentOverview = useCallback(async () => {
		const requestId = overviewRequestId.current + 1;
		overviewRequestId.current = requestId;
		setIsLoadingOverview(true);
		setOverviewMessage('');

		try {
			const result = await listAdminEnrollments({
				q: appliedFilters.q,
				status: appliedFilters.status,
				categories: appliedFilters.categories,
				level: appliedFilters.level,
				mode: appliedFilters.mode,
				page: overviewPage,
				pageSize: PAGE_SIZE
			});

			if (overviewRequestId.current !== requestId) {
				return;
			}

			setOverviewEnrollments(result.enrollments);
			setOverviewPagination(result.pagination);
			setStats(result.stats);
		} catch {
			if (overviewRequestId.current === requestId) {
				setOverviewMessage('Unable to load recent enrollments across courses.');
				setOverviewEnrollments([]);
				setOverviewPagination(defaultPagination);
				setStats(null);
			}
		} finally {
			if (overviewRequestId.current === requestId) {
				setIsLoadingOverview(false);
			}
		}
	}, [appliedFilters, overviewPage]);

	useEffect(() => {
		loadEnrollmentOverview().catch(() => undefined);
	}, [loadEnrollmentOverview]);

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
		setOverviewPage(1);
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
		setOverviewPage(1);
		setAppliedFilters({ ...defaults, categories: [] });
	};

	const changePage = (nextPage: number) => {
		clearSelectedCourse();
		setPage(nextPage);
	};
	const closeMobileDetails = useCallback(() => {
		setIsMobileDetailsOpen(false);
	}, []);
	const metricItems = useMemo(
		() => [
			{
				label: 'Matching courses',
				value: pagination.total,
				icon: <FiBookOpen />
			},
			{
				label: 'Total enrollments',
				value: stats?.totalEnrollmentCount ?? 0,
				icon: <FiLayers />
			},
			{
				label: 'Unique users enrolled',
				value: stats?.uniqueLearnerCount ?? 0,
				icon: <FiUsers />
			}
		],
		[pagination.total, stats]
	);

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
						<HStack gap={2} flexWrap="wrap">
							<Button variant="outline" borderRadius="full" onClick={() => setIsAnalyticsOpen(true)}>
								<FiBarChart2 aria-hidden="true" />
								View analytics
							</Button>
							<Button asChild variant="outline" borderRadius="full">
								<Link href="/admin/courses">Manage courses</Link>
							</Button>
						</HStack>
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

			<AdminMetricsGrid items={metricItems} isLoading={isLoadingOverview || isLoadingCourses} />

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
					onClearSelection={clearSelectedCourse}
					onSelectCourse={course => {
						loadCourseEnrollments(course).catch(() => undefined);
					}}
					onPreviousPage={() => changePage(Math.max(1, page - 1))}
					onNextPage={() => changePage(page + 1)}
				/>
				<Box display={selectedCourse ? { base: 'none', xl: 'block' } : 'block'} minW={0}>
					<EnrollmentLearnerPanel
						enrollments={selectedCourse ? selectedEnrollments : overviewEnrollments}
						errorMessage={selectedCourse ? detailsMessage : overviewMessage}
						isLoading={selectedCourse ? isLoadingDetails : isLoadingOverview}
						onNextPage={() => setOverviewPage(currentPage => currentPage + 1)}
						onPreviousPage={() => setOverviewPage(currentPage => Math.max(1, currentPage - 1))}
						pagination={selectedCourse ? undefined : overviewPagination}
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
			<EnrollmentAnalyticsDialog
				isLoading={isLoadingOverview}
				isOpen={isAnalyticsOpen}
				onOpenChange={setIsAnalyticsOpen}
				stats={stats}
			/>
		</Stack>
	);
};

export default AdminEnrollmentsPage;

'use client';

import { Badge, Box, Button, HStack, Input, Stack, Table, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { trackAdminEnrollmentEvent } from '~/lib/analytics/mixpanel';
import {
	listAdminCourseEnrollments,
	listAdminEnrollmentCourses,
	type AdminCourseEnrollment,
	type AdminEnrollmentCourseSummary,
	type AdminEnrollmentPagination
} from '~/lib/api/admin-enrollments';

const defaultPagination: AdminEnrollmentPagination = {
	page: 1,
	pageSize: 50,
	total: 0,
	totalPages: 1,
	hasNextPage: false,
	hasPreviousPage: false
};

const formatDateTime = (value: string | null) =>
	value
		? new Intl.DateTimeFormat('en-IN', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}).format(new Date(value))
		: 'Not available';

const formatPrice = (value: number) => (value <= 0 ? 'Free' : `₹${value.toLocaleString('en-IN')}`);

const AdminEnrollmentsPage = () => {
	const [courses, setCourses] = useState<AdminEnrollmentCourseSummary[]>([]);
	const [pagination, setPagination] = useState(defaultPagination);
	const [query, setQuery] = useState('');
	const [page, setPage] = useState(1);
	const [selectedCourse, setSelectedCourse] = useState<AdminEnrollmentCourseSummary | null>(null);
	const [selectedEnrollments, setSelectedEnrollments] = useState<AdminCourseEnrollment[]>([]);
	const [isLoadingCourses, setIsLoadingCourses] = useState(true);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);
	const [message, setMessage] = useState('');
	const [detailsMessage, setDetailsMessage] = useState('');
	const selectedCourseTitle = useMemo(() => selectedCourse?.title ?? 'Select a course', [selectedCourse]);

	const loadCourses = useCallback(async () => {
		setIsLoadingCourses(true);
		setMessage('');

		try {
			const result = await listAdminEnrollmentCourses({
				q: query,
				page,
				pageSize: 50
			});
			setCourses(result.courses);
			setPagination(result.pagination);
			trackAdminEnrollmentEvent({
				eventName: 'Course Enrollment Counts Viewed',
				enrollmentCount: result.courses.reduce((total, course) => total + course.enrollmentCount, 0),
				sourcePage: '/admin/enrollments'
			});
		} catch {
			setMessage('Unable to load course enrollment counts.');
		} finally {
			setIsLoadingCourses(false);
		}
	}, [page, query]);

	useEffect(() => {
		loadCourses().catch(() => undefined);
	}, [loadCourses]);

	const loadCourseEnrollments = useCallback(async (course: AdminEnrollmentCourseSummary) => {
		setSelectedCourse(course);
		setIsLoadingDetails(true);
		setDetailsMessage('');

		try {
			const result = await listAdminCourseEnrollments(course.id);
			setSelectedEnrollments(result.enrollments);
			trackAdminEnrollmentEvent({
				eventName: 'Course Enrollment Details Viewed',
				courseId: course.slug,
				courseTitle: course.title,
				enrollmentCount: result.enrollments.length,
				sourcePage: '/admin/enrollments'
			});
		} catch {
			setDetailsMessage('Unable to load enrolled users for this course.');
			setSelectedEnrollments([]);
		} finally {
			setIsLoadingDetails(false);
		}
	}, []);

	const applySearch = () => {
		setPage(1);
		loadCourses().catch(() => undefined);
	};

	const renderSelectedCourseDetails = () => {
		if (isLoadingDetails) {
			return (
				<Text p={5} color="text.muted">
					Loading enrolled users...
				</Text>
			);
		}

		if (detailsMessage) {
			return (
				<Text p={5} color="red.500">
					{detailsMessage}
				</Text>
			);
		}

		if (!selectedCourse) {
			return (
				<Text p={5} color="text.muted">
					No course selected.
				</Text>
			);
		}

		if (!selectedEnrollments.length) {
			return (
				<Text p={5} color="text.muted">
					No users have enrolled in this course yet.
				</Text>
			);
		}

		return (
			<Table.Root size="sm" minW="860px">
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeader>User</Table.ColumnHeader>
						<Table.ColumnHeader>Profile</Table.ColumnHeader>
						<Table.ColumnHeader>Status</Table.ColumnHeader>
						<Table.ColumnHeader>Enrolled</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{selectedEnrollments.map(enrollment => (
						<Table.Row key={enrollment.id}>
							<Table.Cell>
								<Stack gap={1}>
									<Text fontWeight="semibold">{enrollment.user.name || 'Unnamed user'}</Text>
									<Text fontSize="xs" color="text.muted">
										{enrollment.user.email}
									</Text>
								</Stack>
							</Table.Cell>
							<Table.Cell>
								<Stack gap={1} fontSize="xs" color="text.muted">
									<Text>{enrollment.user.profile?.mobileNumberE164 ?? 'No mobile number'}</Text>
									<Text>
										{[enrollment.user.profile?.college, enrollment.user.profile?.department]
											.filter(Boolean)
											.join(' / ') || 'No education profile'}
									</Text>
									<Text>{enrollment.user.profile?.passoutYear ?? 'No passout year'}</Text>
								</Stack>
							</Table.Cell>
							<Table.Cell>
								<Stack gap={1}>
									<Badge>{enrollment.status}</Badge>
									<Text fontSize="xs" color="text.muted">
										{enrollment.progressPercent}% progress
									</Text>
								</Stack>
							</Table.Cell>
							<Table.Cell>
								<Text fontSize="xs">{formatDateTime(enrollment.enrolledAt)}</Text>
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		);
	};

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
								Review enrolled learner counts and open a course to inspect user details.
							</Text>
						</Box>
						<Button asChild variant="outline" borderRadius="full">
							<Link href="/admin/courses">Manage courses</Link>
						</Button>
					</HStack>
					<HStack gap={3} flexWrap="wrap" align="end">
						<Box minW={{ base: '100%', md: '320px' }}>
							<Text fontSize="xs" color="text.muted" mb={1}>
								Search
							</Text>
							<Input
								value={query}
								onChange={event => setQuery(event.currentTarget.value)}
								placeholder="Search by course title or slug"
								h="40px"
							/>
						</Box>
						<Button bg="primary" color="text.inverse" borderRadius="full" h="40px" px={5} onClick={applySearch}>
							Search
						</Button>
						<Button
							variant="outline"
							borderRadius="full"
							h="40px"
							px={5}
							onClick={() => {
								setQuery('');
								setPage(1);
							}}
						>
							Reset
						</Button>
					</HStack>
					{message ? <Text color="red.500">{message}</Text> : null}
				</Stack>
			</Box>

			<Box display="grid" gridTemplateColumns={{ base: '1fr', xl: '0.9fr 1.1fr' }} gap={4} alignItems="start">
				<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" overflowX="auto">
					{isLoadingCourses ? (
						<Text p={5} color="text.muted">
							Loading enrollment counts...
						</Text>
					) : (
						<Table.Root size="sm" minW="760px">
							<Table.Header>
								<Table.Row>
									<Table.ColumnHeader>Course</Table.ColumnHeader>
									<Table.ColumnHeader>Status</Table.ColumnHeader>
									<Table.ColumnHeader>Enrollments</Table.ColumnHeader>
									<Table.ColumnHeader textAlign="right">Action</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{courses.map(course => (
									<Table.Row key={course.id}>
										<Table.Cell>
											<HStack gap={3}>
												<Box
													boxSize="42px"
													borderRadius="md"
													bg="bg.subtle"
													backgroundImage={course.thumbnailImage ? `url(${course.thumbnailImage})` : undefined}
													backgroundSize="cover"
													backgroundPosition="center"
													border="1px solid"
													borderColor="border.default"
												/>
												<Box minW={0}>
													<Text fontWeight="semibold" lineClamp={1}>
														{course.title}
													</Text>
													<Text fontSize="xs" color="text.muted" lineClamp={1}>
														{course.slug} / {formatPrice(course.price)}
													</Text>
												</Box>
											</HStack>
										</Table.Cell>
										<Table.Cell>
											<Badge colorPalette={course.status === 'PUBLISHED' ? 'green' : 'gray'}>{course.status}</Badge>
										</Table.Cell>
										<Table.Cell>
											<Text fontWeight="bold">{course.enrollmentCount}</Text>
											<Text fontSize="xs" color="text.muted">
												recorded users
											</Text>
										</Table.Cell>
										<Table.Cell textAlign="right">
											<Button
												size="xs"
												borderRadius="full"
												bg={selectedCourse?.id === course.id ? 'primary' : undefined}
												color={selectedCourse?.id === course.id ? 'text.inverse' : undefined}
												onClick={() => {
													loadCourseEnrollments(course).catch(() => undefined);
												}}
											>
												View users
											</Button>
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					)}
				</Box>

				<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" overflowX="auto">
					<Stack gap={1} p={4} borderBottom="1px solid" borderColor="border.default">
						<Text fontSize="md" fontWeight="bold">
							{selectedCourseTitle}
						</Text>
						<Text fontSize="xs" color="text.muted">
							{selectedCourse
								? `${selectedEnrollments.length} enrolled users`
								: 'Choose a course from the list to view enrolled users.'}
						</Text>
					</Stack>
					{renderSelectedCourseDetails()}
				</Box>
			</Box>

			<HStack justify="space-between" gap={3} flexWrap="wrap">
				<Text fontSize="sm" color="text.muted">
					Page {pagination.page} of {pagination.totalPages} · {pagination.total} courses
				</Text>
				<HStack gap={2}>
					<Button
						variant="outline"
						borderRadius="full"
						disabled={!pagination.hasPreviousPage}
						onClick={() => setPage(value => Math.max(1, value - 1))}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						borderRadius="full"
						disabled={!pagination.hasNextPage}
						onClick={() => setPage(value => value + 1)}
					>
						Next
					</Button>
				</HStack>
			</HStack>
		</Stack>
	);
};

export default AdminEnrollmentsPage;

'use client';

import { Badge, Box, Button, HStack, Input, Stack, Table, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import {
	listAdminCourses,
	type AdminCourseSummary,
	type AdminCourseLevel,
	type AdminCourseListParams,
	type AdminCourseMode,
	type AdminCoursePagination,
	type AdminCourseStatus
} from '~/lib/api/admin-courses';
import MultiSelectDropdown from '~/lib/components/forms/MultiSelectDropdown';
import { courseCategories } from '~/lib/constants/course-categories';

const courseStatusOptions: Array<{ label: string; value: AdminCourseStatus | '' }> = [
	{ label: 'All statuses', value: '' },
	{ label: 'Draft', value: 'DRAFT' },
	{ label: 'Published', value: 'PUBLISHED' }
];

const courseLevelOptions: Array<{ label: string; value: AdminCourseLevel | '' }> = [
	{ label: 'All levels', value: '' },
	{ label: 'Beginner', value: 'BEGINNER' },
	{ label: 'Intermediate', value: 'INTERMEDIATE' },
	{ label: 'Advanced', value: 'ADVANCED' }
];

const courseModeOptions: Array<{ label: string; value: AdminCourseMode | '' }> = [
	{ label: 'All modes', value: '' },
	{ label: 'Live', value: 'LIVE' },
	{ label: 'Recorded', value: 'RECORDED' },
	{ label: 'Hybrid', value: 'HYBRID' }
];

const sortOptions: Array<{ label: string; value: NonNullable<AdminCourseListParams['sortBy']> }> = [
	{ label: 'Updated', value: 'updatedAt' },
	{ label: 'Created', value: 'createdAt' },
	{ label: 'Title', value: 'title' },
	{ label: 'Status', value: 'status' },
	{ label: 'Published', value: 'publishedAt' },
	{ label: 'Price', value: 'price' },
	{ label: 'Enrollment', value: 'enrollmentCount' },
	{ label: 'Rating', value: 'rating' }
];

const adminCourseDefaultPageSize = 50;
const defaultCourseStatusFilter: AdminCourseStatus = 'PUBLISHED';

const defaultPagination: AdminCoursePagination = {
	page: 1,
	pageSize: adminCourseDefaultPageSize,
	total: 0,
	totalPages: 1,
	hasNextPage: false,
	hasPreviousPage: false
};

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : 'Not published');

const formatPrice = (course: AdminCourseSummary) => {
	if (course.price <= 0) {
		return 'Free';
	}

	return `₹${course.price.toLocaleString('en-IN')}`;
};

const NativeSelect = ({
	label,
	value,
	onChange,
	options
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: Array<{ label: string; value: string }>;
}) => (
	<Box minW={{ base: '100%', md: '150px' }}>
		<Text fontSize="xs" color="text.muted" mb={1}>
			{label}
		</Text>
		<select
			value={value}
			onChange={event => onChange(event.currentTarget.value)}
			style={{
				width: '100%',
				height: '40px',
				border: '1px solid var(--chakra-colors-border-default)',
				borderRadius: '6px',
				background: 'var(--chakra-colors-bg-card)',
				paddingInline: '12px',
				fontSize: '14px'
			}}
		>
			{options.map(option => (
				<option key={option.value || option.label} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	</Box>
);

const AdminCoursesPage = () => {
	const [courses, setCourses] = useState<AdminCourseSummary[]>([]);
	const [pagination, setPagination] = useState(defaultPagination);
	const [query, setQuery] = useState('');
	const [status, setStatus] = useState<AdminCourseStatus | ''>(defaultCourseStatusFilter);
	const [categories, setCategories] = useState<string[]>([]);
	const [level, setLevel] = useState<AdminCourseLevel | ''>('');
	const [mode, setMode] = useState<AdminCourseMode | ''>('');
	const [sortBy, setSortBy] = useState<NonNullable<AdminCourseListParams['sortBy']>>('updatedAt');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [page, setPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState('');

	const loadCourses = useCallback(async () => {
		setIsLoading(true);
		setMessage('');

		try {
			const result = await listAdminCourses({
				q: query,
				status,
				categories,
				level,
				mode,
				sortBy,
				sortOrder,
				page,
				pageSize: adminCourseDefaultPageSize
			});
			setCourses(result.courses);
			setPagination(result.pagination);
		} catch {
			setMessage('Unable to load courses.');
		} finally {
			setIsLoading(false);
		}
	}, [categories, level, mode, page, query, sortBy, sortOrder, status]);

	useEffect(() => {
		loadCourses().catch(() => undefined);
	}, [loadCourses]);

	const applyFilters = () => {
		setPage(1);
		loadCourses().catch(() => undefined);
	};

	const resetFilters = () => {
		setQuery('');
		setStatus(defaultCourseStatusFilter);
		setCategories([]);
		setLevel('');
		setMode('');
		setSortBy('updatedAt');
		setSortOrder('desc');
		setPage(1);
	};

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={4}>
				<Stack gap={4}>
					<HStack justify="space-between" gap={3} flexWrap="wrap">
						<Box>
							<Text fontSize="md" fontWeight="bold">
								All courses
							</Text>
							<Text mt={1} fontSize="xs" color="text.muted">
								Search, filter, sort, and manage courses before publishing.
							</Text>
						</Box>
						<Button asChild bg="primary" color="text.inverse" borderRadius="full">
							<Link href="/admin/courses/new">Add Course</Link>
						</Button>
					</HStack>

					<HStack gap={3} flexWrap="wrap" align="end">
						<Box minW={{ base: '100%', md: '260px' }}>
							<Text fontSize="xs" color="text.muted" mb={1}>
								Search
							</Text>
							<Input
								value={query}
								onChange={event => setQuery(event.target.value)}
								placeholder="Search by title, slug, or subtitle"
								h="40px"
							/>
						</Box>
						<MultiSelectDropdown
							label="Categories"
							options={courseCategories}
							selectedValues={categories}
							onChange={setCategories}
							placeholder="All categories"
							minW={{ base: '100%', md: '240px' }}
						/>
						<NativeSelect
							label="Status"
							value={status}
							onChange={value => setStatus(value as AdminCourseStatus | '')}
							options={courseStatusOptions}
						/>
						<NativeSelect
							label="Level"
							value={level}
							onChange={value => setLevel(value as AdminCourseLevel | '')}
							options={courseLevelOptions}
						/>
						<NativeSelect
							label="Mode"
							value={mode}
							onChange={value => setMode(value as AdminCourseMode | '')}
							options={courseModeOptions}
						/>
						<NativeSelect
							label="Sort"
							value={sortBy}
							onChange={value => setSortBy(value as NonNullable<AdminCourseListParams['sortBy']>)}
							options={sortOptions}
						/>
						<NativeSelect
							label="Order"
							value={sortOrder}
							onChange={value => setSortOrder(value as 'asc' | 'desc')}
							options={[
								{ label: 'Descending', value: 'desc' },
								{ label: 'Ascending', value: 'asc' }
							]}
						/>
						<Button bg="primary" color="text.inverse" borderRadius="full" h="40px" px={5} onClick={applyFilters}>
							Search
						</Button>
						<Button variant="outline" borderRadius="full" h="40px" px={5} onClick={resetFilters}>
							Reset
						</Button>
					</HStack>
					{message ? <Text color="text.muted">{message}</Text> : null}
				</Stack>
			</Box>

			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" overflowX="auto">
				{isLoading ? (
					<Text p={5} color="text.muted">
						Loading courses...
					</Text>
				) : (
					<Table.Root size="sm" minW="1040px">
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader minW="330px">Course</Table.ColumnHeader>
								<Table.ColumnHeader minW="160px">Status</Table.ColumnHeader>
								<Table.ColumnHeader minW="180px">Classification</Table.ColumnHeader>
								<Table.ColumnHeader minW="150px">Metrics</Table.ColumnHeader>
								<Table.ColumnHeader minW="160px">Updated</Table.ColumnHeader>
								<Table.ColumnHeader minW="180px" textAlign="right">
									Action
								</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{courses.map(course => (
								<Table.Row key={course.id}>
									<Table.Cell>
										<HStack gap={3} align="center">
											<Box
												boxSize="44px"
												borderRadius="md"
												bg="bg.subtle"
												backgroundImage={
													course.thumbnailImage || course.promoImage
														? `url(${course.thumbnailImage || course.promoImage})`
														: undefined
												}
												backgroundSize="cover"
												backgroundPosition="center"
												border="1px solid"
												borderColor="border.default"
												flexShrink={0}
											/>
											<Box minW={0}>
												<Text fontWeight="semibold" lineClamp={1}>
													{course.title}
												</Text>
												<Text fontSize="xs" color="text.muted" lineClamp={1}>
													{course.slug}
												</Text>
											</Box>
										</HStack>
									</Table.Cell>
									<Table.Cell>
										<Stack gap={1}>
											<Badge w="fit-content" colorPalette={course.status === 'PUBLISHED' ? 'green' : 'gray'}>
												{course.status}
											</Badge>
											<Text fontSize="xs" color="text.muted">
												{formatDate(course.publishedAt)}
											</Text>
										</Stack>
									</Table.Cell>
									<Table.Cell>
										<Stack gap={1} fontSize="xs">
											{course.categories.length ? (
												<HStack gap={1} flexWrap="wrap">
													{course.categories.map(category => (
														<Badge key={category} borderRadius="full">
															{category}
														</Badge>
													))}
												</HStack>
											) : (
												<Text>No categories</Text>
											)}
											<Text color="text.muted">
												{course.level} / {course.mode}
											</Text>
										</Stack>
									</Table.Cell>
									<Table.Cell>
										<Stack gap={1} fontSize="xs">
											<Text>{formatPrice(course)}</Text>
											<Text color="text.muted">
												{course.rating.toFixed(1)} rating / {course.enrollmentCount} learners
											</Text>
										</Stack>
									</Table.Cell>
									<Table.Cell>
										<Text fontSize="xs">{formatDate(course.updatedAt)}</Text>
									</Table.Cell>
									<Table.Cell textAlign="right">
										<HStack gap={2} justify="flex-end">
											<Button asChild size="xs" borderRadius="full" variant="outline">
												<Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
											</Button>
											<Button asChild size="xs" borderRadius="full" variant="outline">
												<Link href={`/course/${course.slug}`} target="_blank">
													View
												</Link>
											</Button>
										</HStack>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				)}
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

export default AdminCoursesPage;

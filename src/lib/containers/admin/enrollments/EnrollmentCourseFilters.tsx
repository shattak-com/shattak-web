import { Badge, Box, Button, HStack, Input, Text, chakra } from '@chakra-ui/react';
import type { FormEvent } from 'react';

import type { AdminCourseLevel, AdminCourseMode, AdminCourseStatus } from '~/lib/api/admin-courses';
import type { AdminEnrollmentCourseListParams } from '~/lib/api/admin-enrollments';
import MultiSelectDropdown from '~/lib/components/forms/MultiSelectDropdown';
import { courseCategories } from '~/lib/constants/course-categories';

export type EnrollmentCourseFilterValues = {
	q: string;
	status: AdminCourseStatus | '';
	categories: string[];
	level: AdminCourseLevel | '';
	mode: AdminCourseMode | '';
	sortBy: NonNullable<AdminEnrollmentCourseListParams['sortBy']>;
	sortOrder: NonNullable<AdminEnrollmentCourseListParams['sortOrder']>;
};

type EnrollmentCourseFiltersProps = {
	appliedFilterCount: number;
	filters: EnrollmentCourseFilterValues;
	isLoading: boolean;
	onChange: (filters: EnrollmentCourseFilterValues) => void;
	onReset: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const statusOptions: Array<{ label: string; value: AdminCourseStatus | '' }> = [
	{ label: 'All statuses', value: '' },
	{ label: 'Draft', value: 'DRAFT' },
	{ label: 'Published', value: 'PUBLISHED' }
];

const levelOptions: Array<{ label: string; value: AdminCourseLevel | '' }> = [
	{ label: 'All levels', value: '' },
	{ label: 'Beginner', value: 'BEGINNER' },
	{ label: 'Intermediate', value: 'INTERMEDIATE' },
	{ label: 'Advanced', value: 'ADVANCED' }
];

const modeOptions: Array<{ label: string; value: AdminCourseMode | '' }> = [
	{ label: 'All modes', value: '' },
	{ label: 'Live', value: 'LIVE' },
	{ label: 'Recorded', value: 'RECORDED' },
	{ label: 'Hybrid', value: 'HYBRID' }
];

const sortOptions: Array<{
	label: string;
	value: NonNullable<AdminEnrollmentCourseListParams['sortBy']>;
}> = [
	{ label: 'Enrollment', value: 'enrollmentCount' },
	{ label: 'Updated', value: 'updatedAt' },
	{ label: 'Created', value: 'createdAt' },
	{ label: 'Title', value: 'title' },
	{ label: 'Status', value: 'status' },
	{ label: 'Published', value: 'publishedAt' },
	{ label: 'Price', value: 'price' },
	{ label: 'Rating', value: 'rating' }
];

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
		<Text as="label" display="block" fontSize="xs" color="text.muted" mb={1}>
			{label}
		</Text>
		<select
			aria-label={label}
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

const EnrollmentCourseFilters = ({
	appliedFilterCount,
	filters,
	isLoading,
	onChange,
	onReset,
	onSubmit
}: EnrollmentCourseFiltersProps) => (
	<form onSubmit={onSubmit}>
		<HStack gap={3} flexWrap="wrap" align="end">
			<Box minW={{ base: '100%', md: '280px' }}>
				<chakra.label htmlFor="enrollment-course-search" display="block" fontSize="xs" color="text.muted" mb={1}>
					Search
				</chakra.label>
				<Input
					id="enrollment-course-search"
					value={filters.q}
					onChange={event => onChange({ ...filters, q: event.currentTarget.value })}
					placeholder="Search by title, slug, or summary"
					h="40px"
				/>
			</Box>
			<MultiSelectDropdown
				label="Categories"
				options={courseCategories}
				selectedValues={filters.categories}
				onChange={categories => onChange({ ...filters, categories })}
				placeholder="All categories"
				minW={{ base: '100%', md: '240px' }}
			/>
			<NativeSelect
				label="Status"
				value={filters.status}
				onChange={status => onChange({ ...filters, status: status as AdminCourseStatus | '' })}
				options={statusOptions}
			/>
			<NativeSelect
				label="Level"
				value={filters.level}
				onChange={level => onChange({ ...filters, level: level as AdminCourseLevel | '' })}
				options={levelOptions}
			/>
			<NativeSelect
				label="Mode"
				value={filters.mode}
				onChange={mode => onChange({ ...filters, mode: mode as AdminCourseMode | '' })}
				options={modeOptions}
			/>
			<NativeSelect
				label="Sort"
				value={filters.sortBy}
				onChange={sortBy =>
					onChange({
						...filters,
						sortBy: sortBy as NonNullable<AdminEnrollmentCourseListParams['sortBy']>
					})
				}
				options={sortOptions}
			/>
			<NativeSelect
				label="Order"
				value={filters.sortOrder}
				onChange={sortOrder => onChange({ ...filters, sortOrder: sortOrder as 'asc' | 'desc' })}
				options={[
					{ label: 'Descending', value: 'desc' },
					{ label: 'Ascending', value: 'asc' }
				]}
			/>
			<Button type="submit" bg="primary" color="text.inverse" borderRadius="full" h="40px" px={5} loading={isLoading}>
				Search
			</Button>
			<Button type="button" variant="outline" borderRadius="full" h="40px" px={5} onClick={onReset}>
				Reset
			</Button>
			{appliedFilterCount > 0 ? (
				<Badge variant="subtle" colorPalette="orange">
					{appliedFilterCount} {appliedFilterCount === 1 ? 'filter' : 'filters'} applied
				</Badge>
			) : null}
		</HStack>
	</form>
);

export default EnrollmentCourseFilters;

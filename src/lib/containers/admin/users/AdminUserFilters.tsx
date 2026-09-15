import { Badge, Box, Button, HStack, Input, chakra } from '@chakra-ui/react';
import type { FormEvent } from 'react';

import type { AdminUserFilterOptions, AdminUserListParams } from '~/lib/api/admin-users';

export type AdminUserFilterValues = Required<Omit<AdminUserListParams, 'page' | 'pageSize'>>;

type AdminUserFiltersProps = {
	appliedFilterCount: number;
	filters: AdminUserFilterValues;
	filterOptions: AdminUserFilterOptions;
	isLoading: boolean;
	onChange: (filters: AdminUserFilterValues) => void;
	onReset: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const NativeSelect = ({
	id,
	label,
	value,
	onChange,
	options
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: Array<{ label: string; value: string }>;
}) => (
	<Box minW={{ base: '100%', md: '180px' }}>
		<chakra.label htmlFor={id} display="block" fontSize="xs" color="text.muted" mb={1}>
			{label}
		</chakra.label>
		<select
			id={id}
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

const withAllOption = (label: string, values: string[]) => [
	{ label, value: '' },
	...values.map(value => ({ label: value, value }))
];

const AdminUserFilters = ({
	appliedFilterCount,
	filters,
	filterOptions,
	isLoading,
	onChange,
	onReset,
	onSubmit
}: AdminUserFiltersProps) => (
	<form onSubmit={onSubmit}>
		<HStack gap={3} flexWrap="wrap" align="end">
			<Box minW={{ base: '100%', md: '280px' }}>
				<chakra.label htmlFor="admin-user-search" display="block" fontSize="xs" color="text.muted" mb={1}>
					Search
				</chakra.label>
				<Input
					id="admin-user-search"
					value={filters.q}
					onChange={event => onChange({ ...filters, q: event.currentTarget.value })}
					placeholder="Search by name or email"
					h="40px"
				/>
			</Box>
			<NativeSelect
				id="admin-user-college"
				label="College"
				value={filters.college}
				onChange={college => onChange({ ...filters, college })}
				options={withAllOption('All colleges', filterOptions.colleges)}
			/>
			<NativeSelect
				id="admin-user-department"
				label="Department"
				value={filters.department}
				onChange={department => onChange({ ...filters, department })}
				options={withAllOption('All departments', filterOptions.departments)}
			/>
			<NativeSelect
				id="admin-user-passout-year"
				label="Passout year"
				value={filters.passoutYear}
				onChange={passoutYear => onChange({ ...filters, passoutYear })}
				options={withAllOption('All years', filterOptions.passoutYears)}
			/>
			<NativeSelect
				id="admin-user-interest"
				label="Interest"
				value={filters.interest}
				onChange={interest => onChange({ ...filters, interest })}
				options={withAllOption('All interests', filterOptions.interests)}
			/>
			<NativeSelect
				id="admin-user-sort"
				label="Joined"
				value={filters.joinedOrder}
				onChange={joinedOrder => onChange({ ...filters, joinedOrder: joinedOrder as 'asc' | 'desc' })}
				options={[
					{ label: 'Recently joined', value: 'desc' },
					{ label: 'Earliest joined', value: 'asc' }
				]}
			/>
			<Button type="submit" bg="primary" color="text.inverse" borderRadius="full" h="40px" px={5} loading={isLoading}>
				Apply filters
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

export default AdminUserFilters;

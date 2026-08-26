'use client';

import { Badge, Box, Button, HStack, Stack, Table, Text } from '@chakra-ui/react';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiClock, FiPhone, FiTrendingUp, FiUsers } from 'react-icons/fi';

import {
	deleteAdminUser,
	listAdminUsers,
	type AdminManagedUser,
	type AdminUserFilterOptions,
	type AdminUserStats
} from '~/lib/api/admin-users';
import AdminMetricsGrid from '~/lib/containers/admin/components/AdminMetricsGrid';
import { useAdminShellUser } from '~/lib/containers/admin/components/AdminShell';
import AdminUserFilters, { type AdminUserFilterValues } from '~/lib/containers/admin/users/AdminUserFilters';
import { formatMonthKey } from '~/lib/containers/admin/utils/monthly-metrics';

const createDefaultFilters = (): AdminUserFilterValues => ({
	q: '',
	college: '',
	department: '',
	passoutYear: '',
	interest: '',
	joinedOrder: 'desc'
});

const emptyFilterOptions: AdminUserFilterOptions = {
	colleges: [],
	departments: [],
	passoutYears: [],
	interests: []
};

const formatDate = (value: string | null) => {
	if (!value) {
		return 'Never';
	}

	return new Date(value).toLocaleDateString();
};

const getUserDisplayName = (user: AdminManagedUser) => user.name.trim() || user.email;

const getOnboardingStatusLabel = (user: AdminManagedUser) => {
	if (!user.profile) {
		return 'No profile';
	}

	return user.profile.onboardingCompleted ? 'Onboarded' : 'Incomplete';
};

const getDeleteDisabledReason = (adminUserId: string, adminRoles: string[], user: AdminManagedUser) => {
	if (user.id === adminUserId) {
		return 'Current admin';
	}

	if (user.roles.includes('SUPER_ADMIN')) {
		return 'Protected';
	}

	if (user.roles.includes('ADMIN') && !adminRoles.includes('SUPER_ADMIN')) {
		return 'Super admin only';
	}

	return '';
};

export const AdminUsersContent = () => {
	const adminUser = useAdminShellUser();
	const [users, setUsers] = useState<AdminManagedUser[]>([]);
	const [filters, setFilters] = useState<AdminUserFilterValues>(createDefaultFilters);
	const [appliedFilters, setAppliedFilters] = useState<AdminUserFilterValues>(createDefaultFilters);
	const [filterOptions, setFilterOptions] = useState<AdminUserFilterOptions>(emptyFilterOptions);
	const [stats, setStats] = useState<AdminUserStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [deletingUserId, setDeletingUserId] = useState('');
	const [userPendingDeletionId, setUserPendingDeletionId] = useState('');
	const [message, setMessage] = useState('');
	const adminRoles = useMemo(() => adminUser.roles, [adminUser.roles]);

	const loadUsers = useCallback(async (nextFilters: AdminUserFilterValues) => {
		setIsLoading(true);
		setMessage('');

		try {
			const result = await listAdminUsers(nextFilters);
			setUsers(result.users);
			setStats(result.stats);
			setFilterOptions(result.filterOptions);
		} catch {
			setMessage('Unable to load users.');
			setUsers([]);
			setStats(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadUsers(createDefaultFilters()).catch(() => undefined);
	}, [loadUsers]);

	const handleDeleteUser = async (user: AdminManagedUser) => {
		setDeletingUserId(user.id);
		setMessage('');

		try {
			await deleteAdminUser(user.id);
			await loadUsers(appliedFilters);
			setMessage('User deleted.');
			setUserPendingDeletionId('');
		} catch {
			setMessage('Unable to delete user.');
		} finally {
			setDeletingUserId('');
		}
	};
	const applyFilters = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const nextFilters = { ...filters, q: filters.q.trim() };
		setAppliedFilters(nextFilters);
		setUserPendingDeletionId('');
		loadUsers(nextFilters).catch(() => undefined);
	};
	const resetFilters = () => {
		const defaults = createDefaultFilters();
		setFilters(defaults);
		setAppliedFilters(defaults);
		setUserPendingDeletionId('');
		loadUsers(defaults).catch(() => undefined);
	};
	const appliedFilterCount = useMemo(
		() =>
			[
				appliedFilters.q,
				appliedFilters.college,
				appliedFilters.department,
				appliedFilters.passoutYear,
				appliedFilters.interest
			].filter(Boolean).length,
		[appliedFilters]
	);
	const metricItems = useMemo(
		() => [
			{ label: 'Total users', value: stats?.totalUserCount ?? 0, icon: <FiUsers /> },
			{ label: 'Users with phone numbers', value: stats?.usersWithPhoneCount ?? 0, icon: <FiPhone /> },
			{
				label: `New signups · ${stats ? formatMonthKey(stats.currentMonthKey, false) : 'current month'}`,
				value: stats?.currentMonthSignupCount ?? 0,
				helperText: stats ? formatMonthKey(stats.currentMonthKey) : undefined,
				icon: <FiCalendar />
			},
			{
				label: `New signups · ${stats ? formatMonthKey(stats.previousMonthKey, false) : 'previous month'}`,
				value: stats?.previousMonthSignupCount ?? 0,
				helperText: stats ? formatMonthKey(stats.previousMonthKey) : undefined,
				icon: <FiClock />
			},
			{
				label: 'Average signups / month',
				value: stats?.averageSignupsPerMonth ?? 0,
				helperText: stats ? `Since ${formatMonthKey(stats.baselineMonthKey)}` : undefined,
				icon: <FiTrendingUp />
			}
		],
		[stats]
	);

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={4}>
				<Stack gap={3}>
					<Box>
						<Text fontSize="md" fontWeight="bold">
							Registered users
						</Text>
						<Text mt={1} fontSize="xs" color="text.muted">
							View account, role, onboarding, profile, and session details.
						</Text>
					</Box>
					<AdminUserFilters
						appliedFilterCount={appliedFilterCount}
						filters={filters}
						filterOptions={filterOptions}
						isLoading={isLoading}
						onChange={setFilters}
						onReset={resetFilters}
						onSubmit={applyFilters}
					/>
					{message ? <Text color="text.muted">{message}</Text> : null}
				</Stack>
			</Box>

			<AdminMetricsGrid items={metricItems} isLoading={isLoading} />

			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" overflowX="auto">
				{isLoading ? (
					<Text p={5} color="text.muted">
						Loading users...
					</Text>
				) : (
					<Table.Root size="sm" minW="1320px">
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader minW="250px">User</Table.ColumnHeader>
								<Table.ColumnHeader minW="160px">Roles</Table.ColumnHeader>
								<Table.ColumnHeader minW="360px">Profile</Table.ColumnHeader>
								<Table.ColumnHeader minW="280px">Enrolled courses</Table.ColumnHeader>
								<Table.ColumnHeader minW="180px">Activity</Table.ColumnHeader>
								<Table.ColumnHeader minW="140px" textAlign="right">
									Action
								</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{users.length === 0 ? (
								<Table.Row>
									<Table.Cell colSpan={6} py={10} textAlign="center">
										<Text fontWeight="semibold">No users match these filters</Text>
										<Text mt={1} fontSize="xs" color="text.muted">
											Reset one or more filters to broaden the results.
										</Text>
									</Table.Cell>
								</Table.Row>
							) : null}
							{users.map(user => {
								const deleteDisabledReason = getDeleteDisabledReason(adminUser.id, adminRoles, user);
								const { profile } = user;
								const interests = profile?.interests.length ? profile.interests.join(', ') : 'No interests';
								const isPendingDeletion = userPendingDeletionId === user.id;
								const actionContent = (() => {
									if (deleteDisabledReason) {
										return (
											<Text fontSize="xs" color="text.muted">
												{deleteDisabledReason}
											</Text>
										);
									}

									if (isPendingDeletion) {
										return (
											<Stack gap={2} align="flex-end">
												<Text fontSize="xs" color="red.500">
													Delete {getUserDisplayName(user)}?
												</Text>
												<HStack gap={2} justify="flex-end">
													<Button
														size="xs"
														bg="red.500"
														color="white"
														borderRadius="full"
														disabled={deletingUserId === user.id}
														onClick={() => {
															handleDeleteUser(user).catch(() => undefined);
														}}
													>
														{deletingUserId === user.id ? 'Deleting...' : 'Confirm'}
													</Button>
													<Button
														size="xs"
														variant="outline"
														borderRadius="full"
														disabled={deletingUserId === user.id}
														onClick={() => setUserPendingDeletionId('')}
													>
														Cancel
													</Button>
												</HStack>
											</Stack>
										);
									}

									return (
										<Button
											size="xs"
											variant="outline"
											color="red.500"
											borderRadius="full"
											disabled={deletingUserId === user.id}
											onClick={() => setUserPendingDeletionId(user.id)}
										>
											Delete
										</Button>
									);
								})();

								return (
									<Table.Row key={user.id}>
										<Table.Cell>
											<Stack gap={1}>
												<Text fontWeight="semibold">{getUserDisplayName(user)}</Text>
												<Text fontSize="xs" color="text.muted" lineClamp={1}>
													{user.email}
												</Text>
												<HStack gap={1.5} flexWrap="wrap">
													<Badge>{user.status}</Badge>
													<Badge>{user.emailVerified ? 'Verified email' : 'Email not verified'}</Badge>
													<Badge>{user.googleLinked ? 'Google linked' : 'No Google link'}</Badge>
												</HStack>
											</Stack>
										</Table.Cell>
										<Table.Cell>
											<HStack gap={1.5} flexWrap="wrap">
												{user.roles.map(role => (
													<Badge key={role}>{role}</Badge>
												))}
											</HStack>
										</Table.Cell>
										<Table.Cell>
											<Stack gap={1} fontSize="xs" maxW="340px">
												<Text>{profile?.mobileNumberE164 ?? 'No mobile'}</Text>
												<Text color="text.muted" lineClamp={1}>
													{profile?.college ?? 'No college'}
												</Text>
												<Text color="text.muted" lineClamp={1}>
													{profile?.department ?? 'No department'}
												</Text>
												<Text color="text.muted" lineClamp={1}>
													Passout: {profile?.passoutYear ?? 'Not added'}
												</Text>
												<Text color="text.muted" lineClamp={2}>
													{interests}
												</Text>
												<Badge w="fit-content">{getOnboardingStatusLabel(user)}</Badge>
											</Stack>
										</Table.Cell>
										<Table.Cell>
											<Stack gap={1.5} fontSize="xs" maxW="260px">
												<Text fontWeight="semibold">
													{user.enrollmentCount} {user.enrollmentCount === 1 ? 'course' : 'courses'}
												</Text>
												{user.recentCourseEnrollments.length ? (
													<Stack as="ul" gap={1} listStyleType="none">
														{user.recentCourseEnrollments.map(course => (
															<Text as="li" key={course.id} color="text.muted" lineClamp={1} title={course.title}>
																{course.title}
															</Text>
														))}
													</Stack>
												) : (
													<Text color="text.muted">No course enrollments</Text>
												)}
												{user.enrollmentCount > user.recentCourseEnrollments.length ? (
													<Text color="text.brand" fontWeight="semibold">
														+{user.enrollmentCount - user.recentCourseEnrollments.length} more
													</Text>
												) : null}
											</Stack>
										</Table.Cell>
										<Table.Cell>
											<Stack gap={1} fontSize="xs">
												<Text>{user.activeSessionCount} active sessions</Text>
												<Text>{user.mentorApplicationCount} mentor apps</Text>
												<Text color="text.muted">Last: {formatDate(user.lastLoginAt)}</Text>
												<Text color="text.muted">Joined: {formatDate(user.createdAt)}</Text>
											</Stack>
										</Table.Cell>
										<Table.Cell textAlign="right">{actionContent}</Table.Cell>
									</Table.Row>
								);
							})}
						</Table.Body>
					</Table.Root>
				)}
			</Box>
		</Stack>
	);
};

export default AdminUsersContent;

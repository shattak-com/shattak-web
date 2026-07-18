'use client';

import { Badge, Box, Button, HStack, Input, Stack, Table, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { deleteAdminUser, listAdminUsers, type AdminManagedUser } from '~/lib/api/auth';
import { useAdminShellUser } from '~/lib/containers/admin/components/AdminShell';

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
	const [query, setQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [deletingUserId, setDeletingUserId] = useState('');
	const [userPendingDeletionId, setUserPendingDeletionId] = useState('');
	const [message, setMessage] = useState('');
	const adminRoles = useMemo(() => adminUser.roles, [adminUser.roles]);

	const loadUsers = useCallback(async (searchQuery: string) => {
		setIsLoading(true);
		setMessage('');

		try {
			const result = await listAdminUsers(searchQuery);
			setUsers(result.users);
		} catch {
			setMessage('Unable to load users.');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadUsers('').catch(() => undefined);
	}, [loadUsers]);

	const handleDeleteUser = async (user: AdminManagedUser) => {
		setDeletingUserId(user.id);
		setMessage('');

		try {
			await deleteAdminUser(user.id);
			await loadUsers(query);
			setMessage('User deleted.');
			setUserPendingDeletionId('');
		} catch {
			setMessage('Unable to delete user.');
		} finally {
			setDeletingUserId('');
		}
	};

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
					<HStack gap={3} flexWrap="wrap">
						<Input
							value={query}
							onChange={event => setQuery(event.target.value)}
							placeholder="Search by name or email"
							maxW={{ base: '100%', md: '420px' }}
							h="40px"
						/>
						<Button
							bg="primary"
							color="text.inverse"
							borderRadius="full"
							h="40px"
							px={5}
							onClick={() => {
								loadUsers(query).catch(() => undefined);
							}}
						>
							Search
						</Button>
						<Button
							variant="outline"
							borderRadius="full"
							h="40px"
							px={5}
							onClick={() => {
								setQuery('');
								setUserPendingDeletionId('');
								loadUsers('').catch(() => undefined);
							}}
						>
							Reset
						</Button>
					</HStack>
					{message ? <Text color="text.muted">{message}</Text> : null}
				</Stack>
			</Box>

			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" overflowX="auto">
				{isLoading ? (
					<Text p={5} color="text.muted">
						Loading users...
					</Text>
				) : (
					<Table.Root size="sm" minW="1040px">
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader minW="250px">User</Table.ColumnHeader>
								<Table.ColumnHeader minW="160px">Roles</Table.ColumnHeader>
								<Table.ColumnHeader minW="360px">Profile</Table.ColumnHeader>
								<Table.ColumnHeader minW="180px">Activity</Table.ColumnHeader>
								<Table.ColumnHeader minW="140px" textAlign="right">
									Action
								</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
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

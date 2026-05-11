'use client';

import { Badge, Box, Button, Container, Heading, HStack, Input, Stack, Table, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import {
	createAdminInvitation,
	getCurrentAdmin,
	listAdminInvitations,
	revokeAdminInvitation,
	type AdminInvitation,
	type AuthenticatedUser
} from '~/lib/api/auth';

const AdminDashboardPage = () => {
	const [adminUser, setAdminUser] = useState<AuthenticatedUser | null>(null);
	const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
	const [email, setEmail] = useState('');
	const [roleKey, setRoleKey] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState('');

	const canManageAdmins = useMemo(() => adminUser?.roles.includes('SUPER_ADMIN') ?? false, [adminUser]);

	const loadAdminState = useCallback(async () => {
		setIsLoading(true);
		setMessage('');

		try {
			const auth = await getCurrentAdmin();
			setAdminUser(auth.user);

			if (auth.user.roles.includes('SUPER_ADMIN')) {
				const invitationResult = await listAdminInvitations();
				setInvitations(invitationResult.invitations);
			}
		} catch {
			setAdminUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadAdminState().catch(() => undefined);
	}, [loadAdminState]);

	const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);
		setMessage('');

		try {
			await createAdminInvitation(email, roleKey);
			setEmail('');
			const invitationResult = await listAdminInvitations();
			setInvitations(invitationResult.invitations);
			setMessage('Admin invitation created.');
		} catch {
			setMessage('Unable to create admin invitation.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRevoke = async (id: string) => {
		setMessage('');

		try {
			await revokeAdminInvitation(id);
			const invitationResult = await listAdminInvitations();
			setInvitations(invitationResult.invitations);
			setMessage('Admin invitation revoked.');
		} catch {
			setMessage('Unable to revoke invitation.');
		}
	};

	if (isLoading) {
		return (
			<Container maxW="6xl" py={{ base: 12, md: 16 }}>
				<Text color="text.muted">Loading admin session...</Text>
			</Container>
		);
	}

	if (!adminUser) {
		return (
			<Container maxW="lg" py={{ base: 16, md: 24 }}>
				<Stack gap={5}>
					<Heading size="xl">Admin access required</Heading>
					<Text color="text.muted">Please log in with an invited admin Google account.</Text>
					<Button asChild bg="primary" color="text.inverse" borderRadius="full" w="fit-content">
						<Link href="/admin/login">Go to admin login</Link>
					</Button>
				</Stack>
			</Container>
		);
	}

	return (
		<Container maxW="6xl" py={{ base: 10, md: 14 }}>
			<Stack gap={8}>
				<Box>
					<Heading size="xl">Admin Panel</Heading>
					<Text mt={2} color="text.muted">
						Signed in as {adminUser.email}
					</Text>
				</Box>

				{canManageAdmins ? (
					<Stack gap={5}>
						<Box border="1px solid" borderColor="border.default" borderRadius="card" p={5}>
							<form onSubmit={handleInvite}>
								<Stack gap={4}>
									<Heading size="md">Invite admin</Heading>
									<HStack align="end" gap={3} flexWrap="wrap">
										<Box flex="1" minW="260px">
											<Text fontSize="sm" mb={1} color="text.muted">
												Email
											</Text>
											<Input
												type="email"
												value={email}
												onChange={event => setEmail(event.target.value)}
												placeholder="admin@example.com"
												required
											/>
										</Box>
										<Box minW="180px">
											<Text fontSize="sm" mb={1} color="text.muted">
												Role
											</Text>
											<select
												value={roleKey}
												onChange={event => setRoleKey(event.currentTarget.value as 'ADMIN' | 'SUPER_ADMIN')}
												style={{
													width: '100%',
													height: '40px',
													border: '1px solid var(--chakra-colors-border-default)',
													borderRadius: '6px',
													paddingInline: '12px',
													background: 'var(--chakra-colors-bg-card)'
												}}
											>
												<option value="ADMIN">Admin</option>
												<option value="SUPER_ADMIN">Super Admin</option>
											</select>
										</Box>
										<Button type="submit" disabled={isSubmitting} bg="primary" color="text.inverse" borderRadius="full">
											{isSubmitting ? 'Sending...' : 'Send invite'}
										</Button>
									</HStack>
									{message ? <Text color="text.muted">{message}</Text> : null}
								</Stack>
							</form>
						</Box>

						<Box border="1px solid" borderColor="border.default" borderRadius="card" overflow="hidden">
							<Table.Root size="sm">
								<Table.Header>
									<Table.Row>
										<Table.ColumnHeader>Email</Table.ColumnHeader>
										<Table.ColumnHeader>Role</Table.ColumnHeader>
										<Table.ColumnHeader>Status</Table.ColumnHeader>
										<Table.ColumnHeader>Expires</Table.ColumnHeader>
										<Table.ColumnHeader textAlign="right">Action</Table.ColumnHeader>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{invitations.map(invitation => (
										<Table.Row key={invitation.id}>
											<Table.Cell>{invitation.email}</Table.Cell>
											<Table.Cell>{invitation.roleKey}</Table.Cell>
											<Table.Cell>
												<Badge>{invitation.status}</Badge>
											</Table.Cell>
											<Table.Cell>{new Date(invitation.expiresAt).toLocaleDateString()}</Table.Cell>
											<Table.Cell textAlign="right">
												{invitation.status === 'PENDING' ? (
													<Button size="xs" variant="outline" onClick={() => handleRevoke(invitation.id)}>
														Revoke
													</Button>
												) : null}
											</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table.Root>
						</Box>
					</Stack>
				) : (
					<Text color="text.muted">You have admin access. Super admin access is required to invite other admins.</Text>
				)}
			</Stack>
		</Container>
	);
};

export default AdminDashboardPage;

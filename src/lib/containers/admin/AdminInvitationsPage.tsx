'use client';

import { Badge, Box, Button, HStack, Input, Stack, Table, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import {
	createAdminInvitation,
	listAdminInvitations,
	revokeAdminInvitation,
	type AdminInvitation
} from '~/lib/api/auth';
import { useAdminShellUser } from '~/lib/containers/admin/components/AdminShell';

export const AdminInvitationsContent = () => {
	const adminUser = useAdminShellUser();
	const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
	const [email, setEmail] = useState('');
	const [roleKey, setRoleKey] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState('');
	const canManageAdmins = useMemo(() => adminUser.roles.includes('SUPER_ADMIN'), [adminUser.roles]);

	const loadInvitations = useCallback(async () => {
		if (!canManageAdmins) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setMessage('');

		try {
			const invitationResult = await listAdminInvitations();
			setInvitations(invitationResult.invitations);
		} catch {
			setMessage('Unable to load admin invitations.');
		} finally {
			setIsLoading(false);
		}
	}, [canManageAdmins]);

	useEffect(() => {
		loadInvitations().catch(() => undefined);
	}, [loadInvitations]);

	const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);
		setMessage('');

		try {
			await createAdminInvitation(email, roleKey);
			setEmail('');
			await loadInvitations();
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
			await loadInvitations();
			setMessage('Admin invitation revoked.');
		} catch {
			setMessage('Unable to revoke invitation.');
		}
	};

	if (!canManageAdmins) {
		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="2xl" bg="bg.card" p={6}>
				<Text color="text.muted">Super admin access is required to invite or manage administrators.</Text>
			</Box>
		);
	}

	return (
		<Stack gap={5}>
			<Box border="1px solid" borderColor="border.default" borderRadius="2xl" bg="bg.card" p={5}>
				<form onSubmit={handleInvite}>
					<Stack gap={4}>
						<Box>
							<Text fontSize="lg" fontWeight="bold">
								Invite admin
							</Text>
							<Text mt={1} fontSize="sm" color="text.muted">
								Send access to an invited Google account.
							</Text>
						</Box>
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

			<Box border="1px solid" borderColor="border.default" borderRadius="2xl" bg="bg.card" overflow="hidden">
				{isLoading ? (
					<Text p={5} color="text.muted">
						Loading invitations...
					</Text>
				) : (
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
				)}
			</Box>
		</Stack>
	);
};

export default AdminInvitationsContent;

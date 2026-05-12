'use client';

import { Box, Button, Container, HStack, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { getCurrentAdmin, logoutAdmin, type AuthenticatedUser } from '~/lib/api/auth';

type AdminShellProps = {
	children: ReactNode;
};

const adminNavItems = [
	{
		id: 'invitations',
		label: 'Invites',
		href: '/admin/invitations'
	},
	{
		id: 'users',
		label: 'Users',
		href: '/admin/users'
	}
] as const;

const AdminShellUserContext = createContext<AuthenticatedUser | null>(null);

export const useAdminShellUser = () => {
	const adminUser = useContext(AdminShellUserContext);

	if (!adminUser) {
		throw new Error('useAdminShellUser must be used inside AdminShell.');
	}

	return adminUser;
};

const getActiveSection = (pathname: string) => {
	if (pathname.startsWith('/admin/invitations')) {
		return 'invitations';
	}

	return 'users';
};

const AdminShell = ({ children }: AdminShellProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const [adminUser, setAdminUser] = useState<AuthenticatedUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const roleLabel = useMemo(() => adminUser?.roles.join(', ') ?? '', [adminUser]);
	const activeSection = getActiveSection(pathname);

	useEffect(() => {
		let isMounted = true;

		getCurrentAdmin()
			.then(auth => {
				if (isMounted) {
					setAdminUser(auth.user);
				}
			})
			.catch(() => {
				if (isMounted) {
					setAdminUser(null);
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const handleLogout = useCallback(async () => {
		setIsLoggingOut(true);
		setErrorMessage('');

		try {
			await logoutAdmin();
			window.google?.accounts.id.disableAutoSelect();
			router.push('/admin/login');
			router.refresh();
		} catch {
			setErrorMessage('Unable to log out. Please try again.');
		} finally {
			setIsLoggingOut(false);
		}
	}, [router]);

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
					<Text as="h1" fontSize="3xl" fontWeight="bold">
						Admin access required
					</Text>
					<Text color="text.muted">Please log in with an invited admin Google account.</Text>
					<Button asChild bg="primary" color="text.inverse" borderRadius="full" w="fit-content">
						<Link href="/admin/login">Go to admin login</Link>
					</Button>
				</Stack>
			</Container>
		);
	}

	return (
		<AdminShellUserContext.Provider value={adminUser}>
			<Box minH="100vh" bg="bg.subtle">
				<Container maxW="none" px={{ base: 3, md: 5 }} py={{ base: 3, md: 4 }}>
					<Box
						display="grid"
						gridTemplateColumns={{ base: '1fr', lg: '220px minmax(0, 1fr)' }}
						gap={{ base: 4, lg: 5 }}
						alignItems="start"
					>
						<Box
							border="1px solid"
							borderColor="border.default"
							borderRadius="xl"
							bg="bg.card"
							p={3}
							position={{ lg: 'sticky' }}
							top={{ lg: 4 }}
						>
							<Stack gap={4}>
								<Box>
									<Text fontSize="lg" fontWeight="bold">
										Shattak Admin
									</Text>
									<Text mt={1} fontSize="xs" color="text.muted" lineClamp={1}>
										{adminUser.email}
									</Text>
									<Text mt={1} fontSize="xs" color="text.muted">
										{roleLabel}
									</Text>
								</Box>

								<Stack gap={2}>
									{adminNavItems.map(item => {
										const isActive = item.id === activeSection;

										return (
											<Link key={item.id} href={item.href}>
												<Box
													borderRadius="full"
													px={3}
													py={2}
													bg={isActive ? 'primary' : 'transparent'}
													color={isActive ? 'text.inverse' : 'text.primary'}
													fontSize="sm"
													fontWeight="semibold"
													_hover={{ bg: isActive ? 'primaryHover' : 'bg.subtle' }}
												>
													{item.label}
												</Box>
											</Link>
										);
									})}
								</Stack>

								<Box h="1px" bg="border.default" />

								<Stack gap={2}>
									<Button
										variant="outline"
										borderRadius="full"
										disabled={isLoggingOut}
										onClick={() => {
											handleLogout().catch(() => undefined);
										}}
									>
										{isLoggingOut ? 'Logging out...' : 'Logout'}
									</Button>
									{errorMessage ? (
										<Text color="red.500" fontSize="sm">
											{errorMessage}
										</Text>
									) : null}
								</Stack>
							</Stack>
						</Box>

						<Box minW={0}>
							<HStack justify="space-between" mb={4} align="flex-start" gap={4}>
								<Box>
									<Text fontSize="xs" fontWeight="bold" color="primary" textTransform="uppercase">
										Admin Panel
									</Text>
									<Text mt={1} fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" lineHeight="short">
										{activeSection === 'users' ? 'User Management' : 'Admin Invitations'}
									</Text>
								</Box>
								<Button asChild variant="outline" borderRadius="full" display={{ base: 'none', md: 'inline-flex' }}>
									<Link href="/">Open site</Link>
								</Button>
							</HStack>
							{children}
						</Box>
					</Box>
				</Container>
			</Box>
		</AdminShellUserContext.Provider>
	);
};

export default AdminShell;

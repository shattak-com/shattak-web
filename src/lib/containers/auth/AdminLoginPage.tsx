'use client';

import { Badge, Box, Button, Container, HStack, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { identifyAuthenticatedMixpanelUser, trackAuthEvent } from '~/lib/analytics/mixpanel';
import { getCurrentAdmin, type AuthResult } from '~/lib/api/auth';
import GoogleLoginButton from '~/lib/components/auth/GoogleLoginButton';
import { AuthPageSkeleton, BlockingProgressOverlay } from '~/lib/components/feedback/LoadingStates';

const AdminLoginPage = () => {
	const router = useRouter();
	const [isCheckingSession, setIsCheckingSession] = useState(true);
	const [loginProgressMessage, setLoginProgressMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		const checkAdminSession = async () => {
			try {
				const result = await getCurrentAdmin();
				identifyAuthenticatedMixpanelUser({
					userId: result.user.id,
					email: result.user.email,
					name: result.user.name,
					roles: result.user.roles,
					status: result.user.status,
					authContext: 'admin'
				});
				trackAuthEvent({
					location: 'auth_admin_login',
					eventName: 'Existing Session Detected',
					method: 'session_check',
					authContext: 'admin',
					redirectPath: '/admin/courses/',
					roles: result.user.roles
				});
				router.replace('/admin/courses/');
			} catch {
				if (isMounted) {
					setIsCheckingSession(false);
				}
			}
		};

		checkAdminSession().catch(() => {
			if (isMounted) {
				setIsCheckingSession(false);
			}
		});

		return () => {
			isMounted = false;
		};
	}, [router]);

	const handleSuccess = useCallback(
		(result: AuthResult) => {
			identifyAuthenticatedMixpanelUser({
				userId: result.user.id,
				email: result.user.email,
				name: result.user.name,
				roles: result.user.roles,
				status: result.user.status,
				authContext: 'admin'
			});
			trackAuthEvent({
				location: 'auth_admin_login',
				eventName: 'Google Login Succeeded',
				method: 'google_button',
				authContext: 'admin',
				redirectPath: '/admin/courses/',
				roles: result.user.roles
			});
			setLoginProgressMessage('Opening the admin workspace...');
			router.replace('/admin/courses/');
		},
		[router]
	);

	return (
		<Container
			maxW="7xl"
			minH="100dvh"
			display="flex"
			alignItems="center"
			justifyContent="center"
			py={{ base: 8, md: 10 }}
		>
			{loginProgressMessage ? (
				<BlockingProgressOverlay title="Admin login successful" message={loginProgressMessage} />
			) : null}
			{isCheckingSession ? (
				<AuthPageSkeleton />
			) : (
				<Box
					w="full"
					maxW="6xl"
					display="grid"
					gridTemplateColumns={{ base: '1fr', lg: '0.95fr 1.05fr' }}
					gap={{ base: 5, lg: 7 }}
					alignItems="stretch"
				>
					<Box
						border="1px solid"
						borderColor="border.default"
						borderRadius="2xl"
						bg="bg.card"
						p={{ base: 7, md: 10, xl: 12 }}
						minH={{ lg: '520px' }}
						display="flex"
						alignItems="center"
					>
						<Stack gap={8} w="full">
							<Box>
								<Badge borderRadius="full" px={3} py={1} colorPalette="red">
									Restricted Access
								</Badge>
								<Text mt={6} as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold" lineHeight="short">
									Admin Login
								</Text>
								<Text mt={4} maxW="420px" color="text.muted" fontSize={{ md: 'lg' }} lineHeight="relaxed">
									Use an invited admin Google account. Normal student accounts cannot access the admin panel.
								</Text>
							</Box>
							<GoogleLoginButton
								context="admin"
								onAuthStart={() => {
									trackAuthEvent({
										location: 'auth_admin_login',
										eventName: 'Google Login Started',
										method: 'google_button',
										authContext: 'admin'
									});
									setLoginProgressMessage('Verifying your admin access...');
								}}
								onAuthError={() => {
									trackAuthEvent({
										location: 'auth_admin_login',
										eventName: 'Google Login Failed',
										method: 'google_button',
										authContext: 'admin',
										errorType: 'unauthorized_or_google_auth_error'
									});
									setLoginProgressMessage('');
								}}
								onSuccess={handleSuccess}
							/>
							<HStack gap={3} flexWrap="wrap">
								<Button asChild variant="outline" borderRadius="full">
									<Link href="/">Back to site</Link>
								</Button>
								<Text fontSize="xs" color="text.muted">
									All access attempts are verified server-side.
								</Text>
							</HStack>
						</Stack>
					</Box>
					<Box
						border="1px solid"
						borderColor="border.default"
						borderRadius="2xl"
						bg="bg.subtle"
						p={{ base: 6, md: 9, xl: 10 }}
						minH={{ lg: '520px' }}
					>
						<Stack gap={6} h="full" justify="center">
							<Text fontSize="xs" fontWeight="bold" color="primary" textTransform="uppercase">
								Control Center
							</Text>
							<Box bg="primary" borderRadius="xl" p={{ base: 5, md: 7 }} color="text.inverse">
								<Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold">
									Admin
								</Text>
								<Text mt={3} fontSize={{ base: 'sm', md: 'md' }} opacity={0.85}>
									Manage invitations, users, mentor reviews, and course operations from one protected workspace.
								</Text>
							</Box>
							<Stack gap={3}>
								{['Google-only access', 'Role-based permissions', 'Protected admin sessions'].map(item => (
									<HStack
										key={item}
										bg="bg.card"
										border="1px solid"
										borderColor="border.default"
										borderRadius="lg"
										p={4}
									>
										<Box boxSize="8px" borderRadius="full" bg="primary" />
										<Text fontSize={{ base: 'sm', md: 'md' }}>{item}</Text>
									</HStack>
								))}
							</Stack>
						</Stack>
					</Box>
				</Box>
			)}
		</Container>
	);
};

export default AdminLoginPage;

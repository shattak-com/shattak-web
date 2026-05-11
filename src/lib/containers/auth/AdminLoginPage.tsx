'use client';

import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getCurrentAdmin } from '~/lib/api/auth';
import GoogleLoginButton from '~/lib/components/auth/GoogleLoginButton';

const AdminLoginPage = () => {
	const router = useRouter();
	const [isCheckingSession, setIsCheckingSession] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const checkAdminSession = async () => {
			try {
				await getCurrentAdmin();
				router.replace('/admin');
				router.refresh();
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

	const handleSuccess = useCallback(() => {
		router.push('/admin');
		router.refresh();
	}, [router]);

	return (
		<Container maxW="lg" py={{ base: 16, md: 24 }}>
			{isCheckingSession ? (
				<Text color="text.muted">Checking admin session...</Text>
			) : (
				<Stack gap={8}>
					<Box>
						<Heading size="xl">Admin Login</Heading>
						<Text mt={3} color="text.muted">
							Use an invited admin Google account. Normal user accounts cannot access the admin panel.
						</Text>
					</Box>
					<GoogleLoginButton context="admin" onSuccess={handleSuccess} />
				</Stack>
			)}
		</Container>
	);
};

export default AdminLoginPage;

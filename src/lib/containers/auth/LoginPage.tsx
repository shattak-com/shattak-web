'use client';

import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getCurrentAdmin, getCurrentUser } from '~/lib/api/auth';
import GoogleLoginButton from '~/lib/components/auth/GoogleLoginButton';
import Header from '~/lib/components/layout/Header';

const LoginPage = () => {
	const router = useRouter();
	const [isCheckingSession, setIsCheckingSession] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const checkSession = async () => {
			try {
				await getCurrentUser();
				router.replace('/profile');
				router.refresh();
				return;
			} catch {
				// Continue to admin-session check.
			}

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

		checkSession().catch(() => {
			if (isMounted) {
				setIsCheckingSession(false);
			}
		});

		return () => {
			isMounted = false;
		};
	}, [router]);

	const handleSuccess = useCallback(() => {
		router.push('/profile');
		router.refresh();
	}, [router]);

	return (
		<>
			<Header />
			<Container maxW="lg" py={{ base: 16, md: 24 }}>
				{isCheckingSession ? (
					<Text color="text.muted">Checking session...</Text>
				) : (
					<Stack gap={8}>
						<Box>
							<Heading size="xl">Log in to Shattak</Heading>
							<Text mt={3} color="text.muted">
								Continue with your Google account to access your learning profile.
							</Text>
						</Box>
						<GoogleLoginButton context="user" onSuccess={handleSuccess} />
					</Stack>
				)}
			</Container>
		</>
	);
};

export default LoginPage;

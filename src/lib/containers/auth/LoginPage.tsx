'use client';

import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import GoogleLoginButton from '~/lib/components/auth/GoogleLoginButton';
import Header from '~/lib/components/layout/Header';

const LoginPage = () => {
	const router = useRouter();
	const handleSuccess = useCallback(() => {
		router.push('/');
		router.refresh();
	}, [router]);

	return (
		<>
			<Header />
			<Container maxW="lg" py={{ base: 16, md: 24 }}>
				<Stack gap={8}>
					<Box>
						<Heading size="xl">Log in to Shattak</Heading>
						<Text mt={3} color="text.muted">
							Continue with your Google account to access your learning profile.
						</Text>
					</Box>
					<GoogleLoginButton context="user" onSuccess={handleSuccess} />
				</Stack>
			</Container>
		</>
	);
};

export default LoginPage;

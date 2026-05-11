'use client';

import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import GoogleLoginButton from '~/lib/components/auth/GoogleLoginButton';

const AdminLoginPage = () => {
	const router = useRouter();
	const handleSuccess = useCallback(() => {
		router.push('/admin');
		router.refresh();
	}, [router]);

	return (
		<Container maxW="lg" py={{ base: 16, md: 24 }}>
			<Stack gap={8}>
				<Box>
					<Heading size="xl">Admin Login</Heading>
					<Text mt={3} color="text.muted">
						Use an invited admin Google account. Normal user accounts cannot access the admin panel.
					</Text>
				</Box>
				<GoogleLoginButton context="admin" onSuccess={handleSuccess} />
			</Stack>
		</Container>
	);
};

export default AdminLoginPage;

'use client';

import { Badge, Box, Button, Container, HStack, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
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
				router.replace('/admin/courses/');
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
		router.push('/admin/courses/');
		router.refresh();
	}, [router]);

	return (
		<Container maxW="5xl" py={{ base: 10, md: 16 }}>
			{isCheckingSession ? (
				<Text color="text.muted">Checking admin session...</Text>
			) : (
				<Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '0.9fr 1.1fr' }} gap={{ base: 5, lg: 6 }}>
					<Box border="1px solid" borderColor="border.default" borderRadius="2xl" bg="bg.card" p={{ base: 6, md: 8 }}>
						<Stack gap={7}>
							<Box>
								<Badge borderRadius="full" px={3} py={1} colorPalette="red">
									Restricted Access
								</Badge>
								<Text mt={5} as="h1" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" lineHeight="short">
									Admin Login
								</Text>
								<Text mt={3} color="text.muted" lineHeight="relaxed">
									Use an invited admin Google account. Normal student accounts cannot access the admin panel.
								</Text>
							</Box>
							<GoogleLoginButton context="admin" onSuccess={handleSuccess} />
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
					<Box border="1px solid" borderColor="border.default" borderRadius="2xl" bg="bg.subtle" p={{ base: 5, md: 7 }}>
						<Stack gap={5} h="full" justify="center">
							<Text fontSize="xs" fontWeight="bold" color="primary" textTransform="uppercase">
								Control Center
							</Text>
							<Box bg="primary" borderRadius="xl" p={5} color="text.inverse">
								<Text fontSize="3xl" fontWeight="bold">
									Admin
								</Text>
								<Text mt={2} fontSize="sm" opacity={0.85}>
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
										p={3}
									>
										<Box boxSize="8px" borderRadius="full" bg="primary" />
										<Text fontSize="sm">{item}</Text>
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

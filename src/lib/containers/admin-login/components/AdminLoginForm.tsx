'use client';

import { Alert, Box, Button, Container, Field, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

const DEFAULT_REDIRECT = '/add-course';

const AdminLoginForm = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const redirectTo = useMemo(() => {
		const nextParam = searchParams.get('next')?.trim();
		if (!nextParam || !nextParam.startsWith('/')) {
			return DEFAULT_REDIRECT;
		}
		return nextParam;
	}, [searchParams]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		const trimmedPassword = password.trim();
		if (!trimmedPassword) {
			setError('Enter the admin password to continue.');
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch('/api/admin/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: trimmedPassword })
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				setError(payload?.error ?? 'Invalid password. Please try again.');
				return;
			}

			router.replace(redirectTo);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Box as="section" py={{ base: 12, md: 16 }} bg="bg.surface">
			<Container maxW="4xl">
				<Stack spacing={6}>
					<Stack spacing={2}>
						<Heading size={{ base: 'lg', md: 'xl' }}>Admin access</Heading>
						<Text color="text.muted">Enter the admin password to access the add course page.</Text>
					</Stack>

					<Box
						as="form"
						onSubmit={handleSubmit}
						bg="bg.card"
						borderRadius="card"
						border="1px solid"
						borderColor="border.default"
						p={{ base: 5, md: 6 }}
						boxShadow="card"
					>
						<Stack spacing={4}>
							<Field.Root>
								<Field.Label>Admin password</Field.Label>
								<Input
									type="password"
									value={password}
									onChange={event => setPassword(event.target.value)}
									autoComplete="current-password"
								/>
							</Field.Root>

							<Button
								type="submit"
								isLoading={isSubmitting}
								borderRadius="full"
								bg="primary"
								color="text.inverse"
								_hover={{ bg: 'primaryHover' }}
								alignSelf="flex-start"
							>
								Continue
							</Button>

							{error ? (
								<Alert.Root status="error" borderRadius="md">
									<Alert.Indicator />
									<Alert.Content>
										<Alert.Description>{error}</Alert.Description>
									</Alert.Content>
								</Alert.Root>
							) : null}
						</Stack>
					</Box>
				</Stack>
			</Container>
		</Box>
	);
};

export default AdminLoginForm;

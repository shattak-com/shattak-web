'use client';

import { Alert, Box, Spinner, Text } from '@chakra-ui/react';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

import { loginAdminWithGoogleCredential, loginWithGoogleCredential } from '~/lib/api/auth';
import type { AuthenticatedUser } from '~/lib/api/auth';
import type { GoogleCredentialResponse } from '~/types/google-identity';

type GoogleLoginButtonProps = {
	context: 'user' | 'admin';
	onSuccess?: (user: AuthenticatedUser) => void | Promise<void>;
};

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const GoogleLoginButton = ({ context, onSuccess }: GoogleLoginButtonProps) => {
	const buttonRef = useRef<HTMLDivElement | null>(null);
	const renderedRef = useRef(false);
	const [scriptReady, setScriptReady] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		if (!googleClientId || !scriptReady || renderedRef.current || !buttonRef.current || !window.google?.accounts.id) {
			return;
		}

		window.google.accounts.id.initialize({
			client_id: googleClientId,
			callback: async (response: GoogleCredentialResponse) => {
				if (!response.credential) {
					return;
				}

				setIsSubmitting(true);
				setErrorMessage('');

				try {
					const result =
						context === 'admin'
							? await loginAdminWithGoogleCredential(response.credential)
							: await loginWithGoogleCredential(response.credential);
					await onSuccess?.(result.user);
				} catch {
					setErrorMessage(
						context === 'admin'
							? 'This Google account does not have admin access.'
							: 'Google login failed. Please try again.'
					);
				} finally {
					setIsSubmitting(false);
				}
			},
			auto_select: false,
			cancel_on_tap_outside: true,
			context: 'signin',
			ux_mode: 'popup',
			use_fedcm_for_prompt: true
		});

		window.google.accounts.id.renderButton(buttonRef.current, {
			type: 'standard',
			theme: 'outline',
			size: 'large',
			text: context === 'admin' ? 'signin_with' : 'continue_with',
			shape: 'pill',
			logo_alignment: 'left',
			width: 320
		});

		renderedRef.current = true;
	}, [context, onSuccess, scriptReady]);

	if (!googleClientId) {
		return (
			<Alert.Root status="warning" borderRadius="md">
				<Alert.Indicator />
				<Alert.Content>
					<Alert.Title>Google login is not configured</Alert.Title>
					<Alert.Description>NEXT_PUBLIC_GOOGLE_CLIENT_ID is required.</Alert.Description>
				</Alert.Content>
			</Alert.Root>
		);
	}

	return (
		<Box>
			<Script
				src="https://accounts.google.com/gsi/client"
				strategy="afterInteractive"
				onLoad={() => setScriptReady(true)}
				onReady={() => setScriptReady(true)}
			/>
			<Box ref={buttonRef} minH="44px" display="flex" alignItems="center" />
			{isSubmitting ? (
				<Box display="flex" alignItems="center" gap={2} mt={3} color="text.muted">
					<Spinner size="sm" />
					<Text fontSize="sm">Signing you in...</Text>
				</Box>
			) : null}
			{errorMessage ? (
				<Alert.Root status="error" borderRadius="md" mt={4}>
					<Alert.Indicator />
					<Alert.Content>
						<Alert.Title>{errorMessage}</Alert.Title>
					</Alert.Content>
				</Alert.Root>
			) : null}
		</Box>
	);
};

export default GoogleLoginButton;

'use client';

import { usePathname, useRouter } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

import { getCurrentUser, loginWithGoogleCredential } from '~/lib/api/auth';
import { getOnboardingStatus } from '~/lib/api/onboarding';
import { getOnboardingRedirectPath } from '~/lib/utils/onboarding';
import type { GoogleCredentialResponse } from '~/types/google-identity';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const shouldSuppressOneTap = (pathname: string | null) =>
	!googleClientId ||
	pathname?.startsWith('/admin') ||
	pathname?.startsWith('/login') ||
	pathname?.startsWith('/onboarding') ||
	pathname?.startsWith('/profile');

const GoogleOneTapProvider = () => {
	const pathname = usePathname();
	const router = useRouter();
	const initializedRef = useRef(false);
	const [scriptReady, setScriptReady] = useState(false);

	useEffect(() => {
		if (!scriptReady || shouldSuppressOneTap(pathname) || initializedRef.current || !window.google?.accounts.id) {
			return undefined;
		}

		let cancelled = false;

		const initializeOneTap = async () => {
			try {
				await getCurrentUser();
				return;
			} catch {
				if (cancelled || !window.google?.accounts.id) {
					return;
				}
			}

			window.google.accounts.id.initialize({
				client_id: googleClientId,
				callback: async (response: GoogleCredentialResponse) => {
					if (!response.credential) {
						return;
					}

					try {
						await loginWithGoogleCredential(response.credential);
						const onboardingStatus = await getOnboardingStatus();
						window.google?.accounts.id.cancel();
						router.push(getOnboardingRedirectPath(onboardingStatus.profile));
						router.refresh();
					} catch {
						window.google?.accounts.id.disableAutoSelect();
					}
				},
				auto_select: false,
				cancel_on_tap_outside: true,
				context: 'signin',
				ux_mode: 'popup',
				use_fedcm_for_prompt: true
			});

			initializedRef.current = true;
			window.google.accounts.id.prompt();
		};

		initializeOneTap().catch(() => undefined);

		return () => {
			cancelled = true;
		};
	}, [pathname, router, scriptReady]);

	if (!googleClientId) {
		return null;
	}

	return (
		<Script
			src="https://accounts.google.com/gsi/client"
			strategy="afterInteractive"
			onLoad={() => setScriptReady(true)}
			onReady={() => setScriptReady(true)}
		/>
	);
};

export default GoogleOneTapProvider;

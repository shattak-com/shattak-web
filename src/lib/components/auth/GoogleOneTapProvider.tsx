'use client';

import { usePathname, useRouter } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

import { identifyAuthenticatedMixpanelUser, trackAuthEvent } from '~/lib/analytics/mixpanel';
import { getCurrentUser, loginWithGoogleCredential } from '~/lib/api/auth';
import { getOnboardingStatus } from '~/lib/api/onboarding';
import { BlockingProgressOverlay } from '~/lib/components/feedback/LoadingStates';
import { getOnboardingRedirectPath } from '~/lib/utils/onboarding';
import { writeCachedOnboardingStatus } from '~/lib/utils/onboarding-session';
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
	const [loginProgressMessage, setLoginProgressMessage] = useState('');

	useEffect(() => {
		if (loginProgressMessage && shouldSuppressOneTap(pathname)) {
			setLoginProgressMessage('');
		}
	}, [loginProgressMessage, pathname]);

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
						trackAuthEvent({
							location: 'auth_google_one_tap',
							eventName: 'Google Login Started',
							method: 'google_one_tap',
							authContext: 'user'
						});
						setLoginProgressMessage('Signing in with Google...');
						const loginResult = await loginWithGoogleCredential(response.credential);
						setLoginProgressMessage('Preparing your learning profile...');
						const onboardingStatus = loginResult.onboardingProfile
							? {
									user: loginResult.user,
									profile: loginResult.onboardingProfile
								}
							: await getOnboardingStatus();
						const redirectPath = getOnboardingRedirectPath(onboardingStatus.profile);

						identifyAuthenticatedMixpanelUser({
							userId: onboardingStatus.user.id,
							email: onboardingStatus.user.email,
							name: onboardingStatus.user.name,
							roles: onboardingStatus.user.roles,
							status: onboardingStatus.user.status,
							authContext: 'user',
							onboardingNextStep: onboardingStatus.profile.nextStep
						});
						trackAuthEvent({
							location: 'auth_google_one_tap',
							eventName: 'Google Login Succeeded',
							method: 'google_one_tap',
							authContext: 'user',
							redirectPath,
							onboardingNextStep: onboardingStatus.profile.nextStep,
							hasOnboardingProfile: Boolean(loginResult.onboardingProfile),
							roles: onboardingStatus.user.roles
						});
						setLoginProgressMessage('Taking you to the next step...');
						writeCachedOnboardingStatus(onboardingStatus);
						window.google?.accounts.id.cancel();
						router.replace(redirectPath);
					} catch {
						trackAuthEvent({
							location: 'auth_google_one_tap',
							eventName: 'Google Login Failed',
							method: 'google_one_tap',
							authContext: 'user',
							errorType: 'google_auth_or_redirect_error'
						});
						setLoginProgressMessage('');
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

	if (!googleClientId || shouldSuppressOneTap(pathname)) {
		return null;
	}

	return (
		<>
			<Script
				src="https://accounts.google.com/gsi/client"
				strategy="afterInteractive"
				onLoad={() => setScriptReady(true)}
				onReady={() => setScriptReady(true)}
			/>
			{loginProgressMessage ? (
				<BlockingProgressOverlay title="Login successful" message={loginProgressMessage} />
			) : null}
		</>
	);
};

export default GoogleOneTapProvider;

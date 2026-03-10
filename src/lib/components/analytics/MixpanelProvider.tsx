'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import {
	ensureMixpanelSessionReplay,
	identifyAnonymousMixpanelUser,
	initMixpanel,
	trackClientError
} from '~/lib/analytics/mixpanel';

const MixpanelProvider = () => {
	const pathname = usePathname();
	const hasInitialized = useRef(false);

	useEffect(() => {
		hasInitialized.current = initMixpanel();
		if (hasInitialized.current) {
			identifyAnonymousMixpanelUser();
		}
	}, []);

	useEffect(() => {
		if (!hasInitialized.current || !pathname) {
			return;
		}

		ensureMixpanelSessionReplay();
	}, [pathname]);

	useEffect(() => {
		if (!hasInitialized.current) {
			return undefined;
		}

		const handleError = (event: ErrorEvent) => {
			trackClientError({
				source: 'window.error',
				message: event.message || 'Unknown client error',
				stack: event.error instanceof Error ? event.error.stack : undefined,
				fileName: event.filename,
				lineNumber: event.lineno,
				columnNumber: event.colno
			});
		};

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			let reason = 'Unhandled promise rejection';
			if (event.reason instanceof Error) {
				reason = event.reason.message;
			} else if (typeof event.reason === 'string') {
				reason = event.reason;
			}
			const stack = event.reason instanceof Error ? event.reason.stack : undefined;

			trackClientError({
				source: 'unhandledrejection',
				message: reason,
				stack
			});
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleUnhandledRejection);

		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleUnhandledRejection);
		};
	}, []);

	return null;
};

export default MixpanelProvider;

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
	ensureMixpanelSessionReplay,
	identifyAnonymousMixpanelUser,
	initMixpanel,
	trackClientError
} from '~/lib/analytics/mixpanel';

const MixpanelProvider = () => {
	const pathname = usePathname();
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		let isMounted = true;

		initMixpanel()
			.then(initialized => {
				if (!isMounted || !initialized) {
					return;
				}

				identifyAnonymousMixpanelUser();
				setIsInitialized(true);
			})
			.catch(() => undefined);

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!isInitialized || !pathname) {
			return;
		}

		ensureMixpanelSessionReplay();
	}, [isInitialized, pathname]);

	useEffect(() => {
		if (!isInitialized) {
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
	}, [isInitialized]);

	return null;
};

export default MixpanelProvider;

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { initMetaPixel, trackMetaPixelPageView } from '~/lib/analytics/meta-pixel';

const MetaPixelProvider = () => {
	const pathname = usePathname();
	const hasInitialized = useRef(false);
	const hasObservedInitialRoute = useRef(false);

	useEffect(() => {
		hasInitialized.current = initMetaPixel();
	}, []);

	useEffect(() => {
		if (!hasInitialized.current || !pathname) {
			return;
		}

		if (!hasObservedInitialRoute.current) {
			hasObservedInitialRoute.current = true;
			return;
		}

		trackMetaPixelPageView();
	}, [pathname]);

	return null;
};

export default MetaPixelProvider;

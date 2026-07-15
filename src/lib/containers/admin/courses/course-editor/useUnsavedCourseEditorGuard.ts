import { useCallback, useEffect, useRef } from 'react';

const unsavedMessage = 'You have unsaved course or curriculum changes. Leave without saving?';

export const useUnsavedCourseEditorGuard = ({
	hasUnsavedChanges,
	isSaving
}: {
	hasUnsavedChanges: boolean;
	isSaving: boolean;
}) => {
	const bypassGuardRef = useRef(false);
	const shouldBlockNavigation = hasUnsavedChanges && !isSaving;

	useEffect(() => {
		bypassGuardRef.current = false;

		if (!shouldBlockNavigation) {
			return undefined;
		}

		const confirmNavigation = () => {
			// eslint-disable-next-line no-alert -- Native confirmation is appropriate for unsaved editor navigation.
			const shouldLeave = window.confirm(unsavedMessage);

			if (shouldLeave) {
				bypassGuardRef.current = true;
			}

			return shouldLeave;
		};

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (bypassGuardRef.current) {
				return;
			}

			event.preventDefault();
			Reflect.set(event, 'returnValue', '');
		};

		const handleDocumentClick = (event: MouseEvent) => {
			if (
				bypassGuardRef.current ||
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}

			const { target } = event;
			const anchor = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null;

			if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
				return;
			}

			const destination = new URL(anchor.href, window.location.href);

			if (destination.href === window.location.href || confirmNavigation()) {
				return;
			}

			event.preventDefault();
			event.stopImmediatePropagation();
		};

		const handlePopState = () => {
			if (bypassGuardRef.current || confirmNavigation()) {
				return;
			}

			window.history.forward();
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('popstate', handlePopState);
		document.addEventListener('click', handleDocumentClick, true);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('popstate', handlePopState);
			document.removeEventListener('click', handleDocumentClick, true);
		};
	}, [shouldBlockNavigation]);

	return useCallback(() => {
		if (!shouldBlockNavigation) {
			return true;
		}

		// eslint-disable-next-line no-alert -- Native confirmation is appropriate for unsaved editor navigation.
		const shouldLeave = window.confirm(unsavedMessage);

		if (shouldLeave) {
			bypassGuardRef.current = true;
		}

		return shouldLeave;
	}, [shouldBlockNavigation]);
};

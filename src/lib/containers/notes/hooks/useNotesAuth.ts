'use client';

import { useEffect, useState } from 'react';

import { getCurrentUser } from '~/lib/api/auth';
import { ApiRequestError } from '~/lib/api/client';

export type NotesAuthState = 'checking' | 'authenticated' | 'anonymous' | 'error';

const useNotesAuth = () => {
	const [authState, setAuthState] = useState<NotesAuthState>('checking');

	useEffect(() => {
		let mounted = true;
		getCurrentUser()
			.then(() => {
				if (mounted) setAuthState('authenticated');
			})
			.catch(error => {
				if (mounted) {
					setAuthState(error instanceof ApiRequestError && error.statusCode === 401 ? 'anonymous' : 'error');
				}
			});

		return () => {
			mounted = false;
		};
	}, []);

	return { authState, setAuthState };
};

export default useNotesAuth;

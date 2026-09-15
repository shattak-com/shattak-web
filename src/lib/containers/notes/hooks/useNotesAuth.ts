'use client';

import { useEffect, useState } from 'react';

import { getCurrentUser } from '~/lib/api/auth';

export type NotesAuthState = 'checking' | 'authenticated' | 'anonymous';

const useNotesAuth = () => {
	const [authState, setAuthState] = useState<NotesAuthState>('checking');

	useEffect(() => {
		let mounted = true;
		getCurrentUser()
			.then(() => {
				if (mounted) setAuthState('authenticated');
			})
			.catch(() => {
				if (mounted) setAuthState('anonymous');
			});

		return () => {
			mounted = false;
		};
	}, []);

	return { authState, setAuthState };
};

export default useNotesAuth;

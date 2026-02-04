'use client';

import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'shattak-theme';

const getSystemTheme = (): ThemeMode => {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredTheme = (): ThemeMode | null => {
	if (typeof window === 'undefined') return null;
	const stored = window.localStorage.getItem(STORAGE_KEY);
	return stored === 'light' || stored === 'dark' ? stored : null;
};

const applyThemeClass = (theme: ThemeMode) => {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	root.classList.remove('light', 'dark');
	root.classList.add(theme);
};

export const useThemeMode = () => {
	const [theme, setTheme] = useState<ThemeMode>('light');

	useEffect(() => {
		const stored = getStoredTheme();
		const nextTheme = stored ?? getSystemTheme();
		setTheme(nextTheme);
		applyThemeClass(nextTheme);
	}, []);

	const setThemeMode = useCallback((nextTheme: ThemeMode) => {
		setTheme(nextTheme);
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(STORAGE_KEY, nextTheme);
		}
		applyThemeClass(nextTheme);
	}, []);

	const toggleTheme = useCallback(() => {
		setThemeMode(theme === 'dark' ? 'light' : 'dark');
	}, [setThemeMode, theme]);

	return { theme, setTheme: setThemeMode, toggleTheme };
};

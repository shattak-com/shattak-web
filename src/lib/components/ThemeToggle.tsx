'use client';

import { IconButton, type IconButtonProps } from '@chakra-ui/react';
import { FiMoon, FiSun } from 'react-icons/fi';

import { useThemeMode } from '~/lib/hooks/useThemeMode';

type ThemeToggleProps = Omit<IconButtonProps, 'aria-label' | 'children' | 'onClick'>;

const ThemeToggle = (props: ThemeToggleProps) => {
	const { theme, toggleTheme } = useThemeMode();
	const isDark = theme === 'dark';
	const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

	return (
		<IconButton
			aria-label={label}
			title={label}
			variant="ghost"
			borderRadius="full"
			color="text.muted"
			_hover={{ bg: 'bg.subtle', color: 'text.primary' }}
			onClick={toggleTheme}
			{...props}
		>
			{isDark ? <FiSun /> : <FiMoon />}
		</IconButton>
	);
};

export default ThemeToggle;

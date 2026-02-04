'use client';

import { IconButton, Portal, Tooltip } from '@chakra-ui/react';
import { FiMoon, FiSun } from 'react-icons/fi';

import { useThemeMode } from '~/lib/hooks/useThemeMode';

const ThemeToggle = () => {
	const { theme, toggleTheme } = useThemeMode();
	const isDark = theme === 'dark';

	return (
		<Tooltip.Root openDelay={200} positioning={{ placement: 'bottom' }}>
			<Tooltip.Trigger asChild>
				<IconButton
					aria-label="Toggle color theme"
					variant="ghost"
					borderRadius="full"
					color="text.muted"
					_hover={{ bg: 'bg.subtle', color: 'text.primary' }}
					onClick={toggleTheme}
				>
					{isDark ? <FiSun /> : <FiMoon />}
				</IconButton>
			</Tooltip.Trigger>
			<Portal>
				<Tooltip.Positioner>
					<Tooltip.Content
						bg="bg.inverse"
						color="text.inverse"
						borderRadius="soft"
						px={3}
						py={2}
						fontSize="xs"
						fontWeight="medium"
						boxShadow="soft"
					>
						<Tooltip.Arrow>
							<Tooltip.ArrowTip />
						</Tooltip.Arrow>
						{isDark ? 'Switch to light mode' : 'Switch to dark mode'}
					</Tooltip.Content>
				</Tooltip.Positioner>
			</Portal>
		</Tooltip.Root>
	);
};

export default ThemeToggle;

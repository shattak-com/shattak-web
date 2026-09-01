'use client';

import { Box, Button, type ButtonProps } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import type { ReactNode } from 'react';

const slideShine = keyframes`
	0%, 18% {
		transform: translateX(-180%) skewX(-20deg);
	}
	55%, 100% {
		transform: translateX(420%) skewX(-20deg);
	}
`;

type ShineButtonProps = Omit<ButtonProps, 'children'> & {
	children: ReactNode;
};

/**
 * Shared high-emphasis CTA with a continuous, reduced-motion-safe light sweep.
 */
const ShineButton = ({ children, ...props }: ShineButtonProps) => (
	<Button
		position="relative"
		overflow="hidden"
		isolation="isolate"
		_before={{
			content: '""',
			position: 'absolute',
			top: '-30%',
			bottom: '-30%',
			left: 0,
			width: '28%',
			background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent)',
			animation: `${slideShine} 2.6s ease-in-out infinite`,
			pointerEvents: 'none',
			zIndex: 0
		}}
		_motionReduce={{
			_before: { animation: 'none' }
		}}
		{...props}
	>
		<Box as="span" position="relative" zIndex={1} display="inline-flex" alignItems="center" gap={2}>
			{children}
		</Box>
	</Button>
);

export default ShineButton;

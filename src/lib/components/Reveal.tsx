'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type RevealProps = {
	children: ReactNode;
	delay?: number;
	duration?: number;
	y?: number;
	scale?: number;
	once?: boolean;
	hover?: boolean;
	hoverLift?: number;
	hoverScale?: number;
};

const Reveal = ({
	children,
	delay = 0,
	duration = 0.65,
	y = 28,
	scale = 0.97,
	once = true,
	hover = false,
	hoverLift = 10,
	hoverScale = 1.02
}: RevealProps) => {
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <>{children}</>;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y, scale }}
			whileInView={{ opacity: 1, y: 0, scale: 1 }}
			whileHover={hover ? { y: -hoverLift, scale: hoverScale } : undefined}
			whileTap={hover ? { scale: 0.985 } : undefined}
			viewport={{ once, amount: 0.2 }}
			transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
			style={{ height: '100%' }}
		>
			{children}
		</motion.div>
	);
};

export default Reveal;

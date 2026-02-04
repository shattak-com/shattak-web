'use client';

import { Box, Button, Container, HStack, Heading, Stack, Text } from '@chakra-ui/react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

const Hero = () => {
	const prefersReducedMotion = useReducedMotion();
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const springX = useSpring(x, { stiffness: 90, damping: 20, mass: 0.6 });
	const springY = useSpring(y, { stiffness: 90, damping: 20, mass: 0.6 });
	const rotateX = useTransform(springY, [-50, 50], [4, -4]);
	const rotateY = useTransform(springX, [-50, 50], [-6, 6]);

	const handleMouseMove = useCallback(
		(event: ReactMouseEvent<HTMLElement>) => {
			if (prefersReducedMotion) return;
			const rect = event.currentTarget.getBoundingClientRect();
			const offsetX = event.clientX - rect.left - rect.width / 2;
			const offsetY = event.clientY - rect.top - rect.height / 2;
			x.set(offsetX / 14);
			y.set(offsetY / 14);
		},
		[prefersReducedMotion, x, y]
	);

	const handleMouseLeave = useCallback(() => {
		x.set(0);
		y.set(0);
	}, [x, y]);

	const TypingLine = ({ text, color, delay = 0 }: { text: string; color?: string; delay?: number }) => {
		const [displayedText, setDisplayedText] = useState('');
		const [showCursor, setShowCursor] = useState(false);

		useEffect(() => {
			if (prefersReducedMotion) {
				setDisplayedText(text);
				return;
			}

			let currentTimeout: NodeJS.Timeout;
			let typingInterval: NodeJS.Timeout;
			let erasingInterval: NodeJS.Timeout;

			const startCycle = () => {
				setShowCursor(true);
				let currentIndex = 0;

				typingInterval = setInterval(() => {
					if (currentIndex < text.length) {
						setDisplayedText(text.slice(0, currentIndex + 1));
						currentIndex++;
					} else {
						clearInterval(typingInterval);
						currentTimeout = setTimeout(() => {
							let eraseIndex = text.length;
							erasingInterval = setInterval(() => {
								if (eraseIndex > 0) {
									setDisplayedText(text.slice(0, eraseIndex - 1));
									eraseIndex--;
								} else {
									clearInterval(erasingInterval);
									currentTimeout = setTimeout(() => startCycle(), 500);
								}
							}, 50);
						}, 2000);
					}
				}, 80);
			};

			currentTimeout = setTimeout(() => startCycle(), delay * 1000);

			return () => {
				clearTimeout(currentTimeout);
				clearInterval(typingInterval);
				clearInterval(erasingInterval);
			};
		}, [text, delay, prefersReducedMotion]);

		return (
			<Box as="span" display="inline-flex" alignItems="center" color={color}>
				<Box as="span" display="inline-block" minW="max-content">
					{displayedText}
					{/* Invisible placeholder to maintain layout */}
					<Box as="span" visibility="hidden" position="absolute">
						{text}
					</Box>
				</Box>
				{showCursor && (
					<Box
						as={motion.span}
						ml="3px"
						w="2px"
						h="1em"
						bg="currentColor"
						animate={{ opacity: [0, 1, 0] }}
						transition={{ duration: 0.9, repeat: Infinity, ease: 'steps(2)' }}
					/>
				)}
			</Box>
		);
	};

	// Floating particles
	const FloatingParticle = ({ delay, duration, xRange, yRange, top, left, right, bottom }: any) => (
		<Box
			as={motion.div}
			position="absolute"
			top={top}
			left={left}
			right={right}
			bottom={bottom}
			w="6px"
			h="6px"
			borderRadius="full"
			bgGradient="var(--chakra-gradients-brand-accent)"
			opacity={0.4}
			animate={
				prefersReducedMotion
					? undefined
					: {
							x: xRange,
							y: yRange,
							scale: [1, 1.5, 1],
							opacity: [0.2, 0.6, 0.2]
						}
			}
			transition={{
				duration,
				repeat: Infinity,
				ease: 'easeInOut',
				delay
			}}
		/>
	);

	return (
		<Box
			as="section"
			id="hero"
			bg="bg.subtle"
			py={{ base: 14, md: 20 }}
			position="relative"
			overflow="hidden"
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
		>
			{/* Background effects */}
			<Box position="absolute" inset="0" pointerEvents="none">
				<Box
					as={motion.div}
					position="absolute"
					top={{ base: '-120px', lg: '-160px' }}
					right={{ base: '-140px', lg: '-120px' }}
					w={{ base: '320px', md: '400px' }}
					h={{ base: '320px', md: '400px' }}
					borderRadius="full"
					bgGradient="var(--chakra-gradients-hero-warm-orb)"
					_dark={{ bgGradient: 'var(--chakra-gradients-hero-warm-orb-dark)' }}
					animate={prefersReducedMotion ? undefined : { x: [0, 16, 0], y: [0, -18, 0], scale: [1, 1.05, 1] }}
					transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
				/>
				<Box
					as={motion.div}
					position="absolute"
					bottom={{ base: '-140px', lg: '-160px' }}
					left={{ base: '-120px', lg: '-140px' }}
					w={{ base: '320px', md: '400px' }}
					h={{ base: '320px', md: '400px' }}
					borderRadius="full"
					bgGradient="var(--chakra-gradients-hero-cool-orb)"
					_dark={{ bgGradient: 'var(--chakra-gradients-hero-cool-orb-dark)' }}
					animate={prefersReducedMotion ? undefined : { x: [0, -12, 0], y: [0, 16, 0] }}
					transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
				/>

				{/* Floating particles */}
				<FloatingParticle delay={0} duration={8} xRange={[0, 100, 0]} yRange={[0, -80, 0]} top="20%" left="15%" />
				<FloatingParticle delay={2} duration={10} xRange={[0, -120, 0]} yRange={[0, 100, 0]} top="60%" right="20%" />
				<FloatingParticle delay={4} duration={12} xRange={[0, 80, 0]} yRange={[0, -100, 0]} bottom="25%" left="25%" />
				<FloatingParticle delay={1} duration={9} xRange={[0, -90, 0]} yRange={[0, 70, 0]} top="40%" right="35%" />
			</Box>

			<Container maxW="6xl" position="relative">
				<Stack direction={{ base: 'column', lg: 'row' }} align="center" spacing={{ base: 8, lg: 10 }}>
					<Box
						as={motion.div}
						initial={{ opacity: 0, y: 32 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
						flex={{ base: 'unset', lg: 1 }}
						textAlign={{ base: 'center', lg: 'left' }}
					>
						{/* Enhanced badge */}
						<Box
							as={motion.div}
							display="inline-flex"
							alignItems="center"
							gap={2}
							px={4}
							py={2}
							bg="bg.glass"
							backdropFilter="blur(10px)"
							borderRadius="full"
							border="1px solid"
							borderColor="border.brandSoft"
							mb={4}
							boxShadow="brandSoft"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							whileHover={{ scale: 1.05, borderColor: 'border.brand' }}
						>
							<Box
								w="8px"
								h="8px"
								borderRadius="full"
								bg="primary"
								as={motion.div}
								animate={{ scale: [1, 1.3, 1] }}
								transition={{ duration: 2, repeat: Infinity }}
							/>
							<Text fontSize="sm" fontWeight="semibold" color="text.secondary">
								🚀 Welcome to Shattak.com
							</Text>
						</Box>

						<Heading
							as={motion.h1}
							fontSize={{ base: '2.4rem', md: '3.6rem', lg: '3rem' }}
							mt={3}
							lineHeight="display"
							fontFamily="display"
							fontWeight="semibold"
							wordSpacing={{ base: '0.08em', md: '0.14em' }}
							initial="hidden"
							animate="show"
							variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
						>
							<Text
								as={motion.span}
								display="block"
								variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
								position="relative"
								minH="1.2em"
							>
								<TypingLine text="Learn From Experts." delay={0.2} />
							</Text>
							<Text
								as={motion.span}
								display="block"
								color="text.brand"
								variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
								position="relative"
								minH="1.2em"
							>
								<TypingLine text="Build What Matters." delay={1.8} color="text.brand" />
							</Text>
						</Heading>

						<Text mt={4} color="text.muted" fontSize={{ base: 'sm', md: 'md' }} lineHeight="relaxed">
							We deliver outcome-driven courses with live mentor sessions to help you build a job-ready portfolio.
						</Text>

						<HStack
							as={motion.div}
							spacing={{ base: 3, md: 4 }}
							mt={8}
							flexWrap={{ base: 'nowrap', md: 'wrap' }}
							justify={{ base: 'center', lg: 'flex-start' }}
							width="100%"
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.35, duration: 0.6 }}
						>
							<Button
								asChild
								size={{ base: 'xs', md: 'md' }}
								bg="var(--chakra-gradients-brand-sunset)"
								color="text.inverse"
								_hover={{ transform: 'translateY(-3px)', boxShadow: 'primaryHover' }}
								borderRadius="full"
								px={{ base: 4, md: 7 }}
								fontSize={{ base: 'xs', md: 'sm' }}
								whiteSpace="nowrap"
								transition="all 0.3s ease"
								boxShadow="primary"
								fontWeight="semibold"
							>
								<Link href="https://forms.gle/yQVwU7FJ9Q5rDHTq7" target="_blank" rel="noopener noreferrer">
									Become an Instructor
								</Link>
							</Button>
							<Button
								asChild
								size={{ base: 'xs', md: 'md' }}
								borderRadius="full"
								px={{ base: 4, md: 7 }}
								bg="bg.card"
								border="2px solid"
								borderColor="border.default"
								color="text.primary"
								_hover={{
									bg: 'bg.subtle',
									borderColor: 'border.brand',
									transform: 'translateY(-3px)',
									boxShadow: 'neutralHover'
								}}
								fontSize={{ base: 'xs', md: 'sm' }}
								whiteSpace="nowrap"
								transition="all 0.3s ease"
								boxShadow="neutral"
								fontWeight="semibold"
							>
								<Link href="https://forms.gle/HqTLJG6EcNzgNRcW9" target="_blank" rel="noopener noreferrer">
									Campus Ambassador Program
								</Link>
							</Button>
						</HStack>
					</Box>

					<Box
						as={motion.div}
						initial={{ opacity: 0, y: 32 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
						display={{ base: 'none', lg: 'block' }}
						flex={{ base: 'unset', lg: 1 }}
						w={{ base: '100%', md: '80%', lg: '48%' }}
						sx={{ perspective: '900px' }}
						position="relative"
					>
						<Box
							as={motion.div}
							style={
								prefersReducedMotion
									? undefined
									: {
											x: springX,
											y: springY,
											rotateX,
											rotateY,
											transformStyle: 'preserve-3d'
										}
							}
							whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
							transition={{ duration: 0.3 }}
						>
							<Box
								as={motion.div}
								animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }}
								transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
								position="relative"
							>
								{/* Glow effect */}
								<Box
									position="absolute"
									inset="-20px"
									bgGradient="var(--chakra-gradients-hero-glow)"
									_dark={{ bgGradient: 'var(--chakra-gradients-hero-glow-dark)' }}
									filter="blur(30px)"
									opacity={0.5}
									pointerEvents="none"
								/>

								<Box
									bg="bg.card"
									borderRadius="surface"
									p={{ base: 4, md: 6 }}
									boxShadow="hero"
									position="relative"
									overflow="hidden"
								>
									{/* Shimmer effect */}
									<Box
										as={motion.div}
										position="absolute"
										top="0"
										left="-100%"
										w="50%"
										h="100%"
										bgGradient="var(--chakra-gradients-shimmer)"
										animate={{ left: ['100%', '-100%'] }}
										transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
									/>

									<Image src="/illustrations/hero.svg" alt="Live class preview" width={640} height={560} priority />
								</Box>

								{/* Floating emoji badges */}
								<Box
									as={motion.div}
									position="absolute"
									top="10%"
									right="-5%"
									bg="bg.card"
									p={3}
									borderRadius="xl"
									boxShadow="float"
									animate={prefersReducedMotion ? undefined : { y: [0, -10, 0], rotate: [0, 5, 0] }}
									transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
								>
									<Text fontSize="2xl">🎯</Text>
								</Box>
								<Box
									as={motion.div}
									position="absolute"
									bottom="15%"
									left="-5%"
									bg="bg.card"
									p={3}
									borderRadius="xl"
									boxShadow="float"
									animate={prefersReducedMotion ? undefined : { y: [0, 10, 0], rotate: [0, -5, 0] }}
									transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
								>
									<Text fontSize="2xl">⚡</Text>
								</Box>
							</Box>
						</Box>
					</Box>
				</Stack>
			</Container>
		</Box>
	);
};

export default Hero;

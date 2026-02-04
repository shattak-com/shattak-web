'use client';

import { Box, Button, Container, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <>{children}</>;
	}

	return (
		<Box
			as={motion.div}
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-100px' }}
			transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
		>
			{children}
		</Box>
	);
};

const InstructorCTA = () => {
	const prefersReducedMotion = useReducedMotion();
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const springX = useSpring(x, { stiffness: 90, damping: 20, mass: 0.6 });
	const springY = useSpring(y, { stiffness: 90, damping: 20, mass: 0.6 });
	const rotateX = useTransform(springY, [-50, 50], [3, -3]);
	const rotateY = useTransform(springX, [-50, 50], [-5, 5]);
	const instructorUrl =
		'https://docs.google.com/forms/d/e/1FAIpQLSeaiX2szx4AT_Qx_4rFrGQXWZbyfm7PBXSX88HfDNPl5VjRCA/viewform';
	const pitchDeckUrl = '/assets/mentor-pitch-deck%20.pdf';

	const handleMouseMove = useCallback(
		(event: ReactMouseEvent<HTMLElement>) => {
			if (prefersReducedMotion) {
				return;
			}
			const rect = event.currentTarget.getBoundingClientRect();
			const offsetX = event.clientX - rect.left - rect.width / 2;
			const offsetY = event.clientY - rect.top - rect.height / 2;
			x.set(offsetX / 18);
			y.set(offsetY / 18);
		},
		[prefersReducedMotion, x, y]
	);

	const handleMouseLeave = useCallback(() => {
		x.set(0);
		y.set(0);
	}, [x, y]);

	// Floating particles
	const FloatingParticle = ({ delay, duration, xRange, yRange, top, left, right, bottom }: any) => (
		<Box
			as={motion.div}
			position="absolute"
			top={top}
			left={left}
			right={right}
			bottom={bottom}
			w="5px"
			h="5px"
			borderRadius="full"
			bgGradient="var(--chakra-gradients-brand-accent)"
			opacity={0.35}
			animate={
				prefersReducedMotion
					? undefined
					: {
							x: xRange,
							y: yRange,
							scale: [1, 1.4, 1],
							opacity: [0.2, 0.5, 0.2]
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
		<Box as="section" id="instructor" py={{ base: 14, md: 20 }}>
			<Container maxW="6xl">
				<Reveal>
					<Box
						bgGradient="var(--chakra-gradients-cta-surface)"
						_dark={{ bgGradient: 'var(--chakra-gradients-cta-surface-dark)' }}
						borderRadius="surface"
						p={{ base: 6, md: 10 }}
						position="relative"
						overflow="hidden"
						onMouseMove={handleMouseMove}
						onMouseLeave={handleMouseLeave}
						boxShadow="glow"
						border="1px solid"
						borderColor="border.glass"
					>
						{/* Background effects */}
						<Box position="absolute" inset="0" pointerEvents="none">
							<Box
								as={motion.div}
								position="absolute"
								top={{ base: '-100px', md: '-120px' }}
								right={{ base: '-100px', md: '-120px' }}
								w={{ base: '240px', md: '300px' }}
								h={{ base: '240px', md: '300px' }}
								borderRadius="full"
								bgGradient="var(--chakra-gradients-cta-warm-orb)"
								_dark={{ bgGradient: 'var(--chakra-gradients-cta-warm-orb-dark)' }}
								filter="blur(40px)"
								animate={prefersReducedMotion ? undefined : { x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.08, 1] }}
								transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
							/>
							<Box
								as={motion.div}
								position="absolute"
								bottom={{ base: '-100px', md: '-120px' }}
								left={{ base: '-80px', md: '-100px' }}
								w={{ base: '240px', md: '300px' }}
								h={{ base: '240px', md: '300px' }}
								borderRadius="full"
								bgGradient="var(--chakra-gradients-cta-cool-orb)"
								_dark={{ bgGradient: 'var(--chakra-gradients-cta-cool-orb-dark)' }}
								filter="blur(40px)"
								animate={prefersReducedMotion ? undefined : { x: [0, -15, 0], y: [0, 15, 0] }}
								transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
							/>

							{/* Floating particles */}
							<FloatingParticle delay={0} duration={7} xRange={[0, 60, 0]} yRange={[0, -50, 0]} top="15%" left="10%" />
							<FloatingParticle
								delay={1.5}
								duration={8}
								xRange={[0, -70, 0]}
								yRange={[0, 60, 0]}
								top="60%"
								right="15%"
							/>
							<FloatingParticle
								delay={3}
								duration={9}
								xRange={[0, 50, 0]}
								yRange={[0, -60, 0]}
								bottom="20%"
								left="20%"
							/>

							{/* Subtle grid pattern */}
							<Box
								position="absolute"
								inset="0"
								opacity={0.02}
								backgroundImage="linear-gradient(var(--chakra-colors-ink-alpha-10) 1px, transparent 1px), linear-gradient(90deg, var(--chakra-colors-ink-alpha-10) 1px, transparent 1px)"
								backgroundSize="40px 40px"
							/>
						</Box>

						<Stack
							direction={{ base: 'column', lg: 'row' }}
							spacing={{ base: 8, lg: 12 }}
							align="center"
							position="relative"
						>
							<Reveal>
								<Box flex="1">
									{/* Icon badge */}
									<Box
										as={motion.div}
										display="inline-flex"
										alignItems="center"
										gap={2}
										px={3}
										py={1.5}
										bg="bg.glass"
										backdropFilter="blur(10px)"
										borderRadius="full"
										border="1px solid"
										borderColor="border.accentSoft"
										mb={4}
										boxShadow="accentSoft"
										whileHover={{ scale: 1.05 }}
										transition={{ duration: 0.2 }}
									>
										<Box
											w="8px"
											h="8px"
											borderRadius="full"
											bg="accent"
											as={motion.div}
											animate={{ scale: [1, 1.3, 1] }}
											transition={{ duration: 2, repeat: Infinity }}
										/>
										<Text fontSize="xs" fontWeight="semibold" color="text.secondary">
											🎓 For Instructors
										</Text>
									</Box>

									<Heading size={{ base: 'lg', md: 'xl' }} fontWeight="bold" lineHeight="title" letterSpacing="subtle">
										Become an Instructor.{' '}
										<Box as="span" bgGradient="var(--chakra-gradients-brand-sunset)" bgClip="text" position="relative">
											Teach the Masses.
											{/* Animated underline */}
											<Box
												as={motion.div}
												position="absolute"
												bottom="-4px"
												left="0"
												right="0"
												h="3px"
												bgGradient="var(--chakra-gradients-brand-accent)"
												borderRadius="full"
												initial={{ scaleX: 0 }}
												whileInView={{ scaleX: 1 }}
												viewport={{ once: true }}
												transition={{ delay: 0.3, duration: 0.8 }}
												transformOrigin="left"
											/>
										</Box>
									</Heading>

									<Text mt={4} color="text.secondary" fontSize={{ base: 'md', md: 'lg' }} lineHeight="body">
										Share your expertise, run live sessions, and inspire the next wave of learners across India.
									</Text>

									<HStack mt={6} spacing={3} flexWrap="wrap">
										<Button
											asChild
											size="lg"
											borderRadius="full"
											bg="var(--chakra-gradients-brand-sunset)"
											color="text.inverse"
											_hover={{ transform: 'translateY(-3px)', boxShadow: 'primaryHover' }}
											transition="all 0.3s ease"
											boxShadow="primary"
											px={7}
											fontWeight="semibold"
										>
											<Link href={instructorUrl} target="_blank" rel="noopener noreferrer">
												Become An Instructor →
											</Link>
										</Button>
										<Button
											as="a"
											size="lg"
											borderRadius="full"
											bg="bg.card"
											border="2px solid"
											borderColor="border.muted"
											color="text.primary"
											_hover={{
												bg: 'bg.subtle',
												borderColor: 'border.accent',
												transform: 'translateY(-3px)',
												boxShadow: 'neutralHover'
											}}
											transition="all 0.3s ease"
											boxShadow="neutral"
											href={pitchDeckUrl}
											download="mentor-pitch-deck.pdf"
											px={7}
											fontWeight="semibold"
										>
											Know More
										</Button>
									</HStack>

									{/* Feature tags */}
									<HStack mt={6} spacing={3} flexWrap="wrap">
										<Box
											as={motion.div}
											px={3}
											py={1.5}
											bg="bg.glassSoft"
											backdropFilter="blur(8px)"
											borderRadius="full"
											fontSize="sm"
											fontWeight="medium"
											color="text.secondary"
											border="1px solid"
											borderColor="border.subtle"
											whileHover={{ scale: 1.05 }}
										>
											💰 Earn from your expertise
										</Box>
										<Box
											as={motion.div}
											px={3}
											py={1.5}
											bg="bg.glassSoft"
											backdropFilter="blur(8px)"
											borderRadius="full"
											fontSize="sm"
											fontWeight="medium"
											color="text.secondary"
											border="1px solid"
											borderColor="border.subtle"
											whileHover={{ scale: 1.05 }}
										>
											🎯 Flexible schedule
										</Box>
										<Box
											as={motion.div}
											px={3}
											py={1.5}
											bg="bg.glassSoft"
											backdropFilter="blur(8px)"
											borderRadius="full"
											fontSize="sm"
											fontWeight="medium"
											color="text.secondary"
											border="1px solid"
											borderColor="border.subtle"
											whileHover={{ scale: 1.05 }}
										>
											🌟 Build your brand
										</Box>
									</HStack>
								</Box>
							</Reveal>

							<Reveal delay={0.1}>
								<Box flex="1" display="flex" justifyContent="center" sx={{ perspective: '1000px' }} position="relative">
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
										whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
										transition={{ duration: 0.3 }}
									>
										<Box
											as={motion.div}
											animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }}
											transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
											position="relative"
										>
											{/* Glow behind image */}
											<Box
												position="absolute"
												inset="-20px"
												bgGradient="var(--chakra-gradients-instructor-glow)"
												_dark={{ bgGradient: 'var(--chakra-gradients-instructor-glow-dark)' }}
												filter="blur(30px)"
												opacity={0.6}
												pointerEvents="none"
											/>

											{/* Decorative elements */}
											<Box
												as={motion.div}
												zIndex={1000}
												position="absolute"
												top="-10px"
												right="-10px"
												w="50px"
												h="50px"
												bg="bg.card"
												borderRadius="xl"
												boxShadow="badge"
												display="flex"
												alignItems="center"
												justifyContent="center"
												fontSize="2xl"
												animate={prefersReducedMotion ? undefined : { rotate: [0, 10, 0], y: [0, -5, 0] }}
												transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
											>
												📚
											</Box>

											<Box
												as={motion.div}
												zIndex={1000}
												position="absolute"
												bottom="10%"
												left="-20px"
												w="50px"
												h="50px"
												bg="bg.card"
												borderRadius="xl"
												boxShadow="badge"
												display="flex"
												alignItems="center"
												justifyContent="center"
												fontSize="2xl"
												animate={prefersReducedMotion ? undefined : { rotate: [0, -10, 0], y: [0, 5, 0] }}
												transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
											>
												🚀
											</Box>

											<Image
												src="/illustrations/instructor.svg"
												alt="Instructor illustration"
												width={460}
												height={360}
												style={{ position: 'relative', zIndex: 1 }}
											/>
										</Box>
									</Box>
								</Box>
							</Reveal>
						</Stack>
					</Box>
				</Reveal>
			</Container>
		</Box>
	);
};

export default InstructorCTA;


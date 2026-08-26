'use client';

import {
	Box as ChakraBox,
	Button,
	Container,
	HStack as ChakraHStack,
	Heading as ChakraHeading,
	Icon as ChakraIcon,
	Stack,
	Text as ChakraText
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import type { MotionProps, MotionStyle } from 'framer-motion';
import Link from 'next/link';
import { useCallback } from 'react';
import type { ComponentProps, ComponentType, ElementType, MouseEvent as ReactMouseEvent } from 'react';
import type { IconType } from 'react-icons';
import { BiLogoMicrosoft } from 'react-icons/bi';
import { FiUsers } from 'react-icons/fi';
import {
	SiAdobe,
	SiAirbnb,
	SiAmazon,
	SiAtlassian,
	SiFlipkart,
	SiGoogle,
	SiInfosys,
	SiLinkedin,
	SiMahindra,
	SiMeta,
	SiNetflix,
	SiPaytm,
	SiPhonepe,
	SiRazorpay,
	SiSalesforce,
	SiSwiggy,
	SiTcs,
	SiWipro,
	SiZoho,
	SiZomato
} from 'react-icons/si';

import { trackCtaClicked } from '~/lib/analytics/mixpanel';
import HeroMedia from '~/lib/containers/home/components/HeroMedia';

type MotionCompatibleProps<T extends ElementType> = Omit<ComponentProps<T>, keyof MotionProps | 'style'> &
	MotionProps & {
		style?: MotionStyle;
	};
type MotionCompatibleComponent<T extends ElementType> = ComponentType<MotionCompatibleProps<T>>;

const Box = ChakraBox as MotionCompatibleComponent<typeof ChakraBox>;
const Heading = ChakraHeading as MotionCompatibleComponent<typeof ChakraHeading>;
const HStack = ChakraHStack as MotionCompatibleComponent<typeof ChakraHStack>;
const Text = ChakraText as MotionCompatibleComponent<typeof ChakraText>;

type FloatingParticleProps = {
	delay: number;
	duration: number;
	xRange: number[];
	yRange: number[];
	reducedMotion: boolean | null;
	top?: string;
	left?: string;
	right?: string;
	bottom?: string;
};

type MentorBrand = {
	name: string;
	icon: IconType;
	color: string;
};

const mentorBrands: MentorBrand[] = [
	{ name: 'Amazon', icon: SiAmazon, color: '#FF9900' },
	{ name: 'Google', icon: SiGoogle, color: '#4285F4' },
	{ name: 'Microsoft', icon: BiLogoMicrosoft, color: '#00A4EF' },
	{ name: 'Zomato', icon: SiZomato, color: '#E23744' },
	{ name: 'TCS', icon: SiTcs, color: '#486AAE' },
	{ name: 'Infosys', icon: SiInfosys, color: '#007CC3' },
	{ name: 'Wipro', icon: SiWipro, color: '#341F65' },
	{ name: 'Razorpay', icon: SiRazorpay, color: '#2B56F5' },
	{ name: 'PhonePe', icon: SiPhonepe, color: '#5F259F' },
	{ name: 'Flipkart', icon: SiFlipkart, color: '#2874F0' },
	{ name: 'Zoho', icon: SiZoho, color: '#E42527' },
	{ name: 'Swiggy', icon: SiSwiggy, color: '#FC8019' },
	{ name: 'Paytm', icon: SiPaytm, color: '#00BAF2' },
	{ name: 'Mahindra', icon: SiMahindra, color: '#E31837' },
	{ name: 'Adobe', icon: SiAdobe, color: '#FF0000' },
	{ name: 'Airbnb', icon: SiAirbnb, color: '#FF5A5F' },
	{ name: 'Atlassian', icon: SiAtlassian, color: '#1868DB' },
	{ name: 'LinkedIn', icon: SiLinkedin, color: '#0A66C2' },
	{ name: 'Meta', icon: SiMeta, color: '#0866FF' },
	{ name: 'Netflix', icon: SiNetflix, color: '#E50914' },
	{ name: 'Salesforce', icon: SiSalesforce, color: '#00A1E0' }
];

const mentorBrandScroll = keyframes`
	from {
		transform: translate3d(0, 0, 0);
	}

	to {
		transform: translate3d(-50%, 0, 0);
	}
`;

type MentorBrandMarqueeProps = {
	prefersReducedMotion: boolean | null;
};

const MentorBrandMarquee = ({ prefersReducedMotion }: MentorBrandMarqueeProps) => {
	const canAnimateBrands = prefersReducedMotion !== true;

	return (
		<Stack
			direction={{ base: 'column', md: 'row' }}
			align={{ base: 'stretch', md: 'center' }}
			gap={{ base: 4, md: 8 }}
			mt={{ base: 10, lg: 12 }}
			p={{ base: 4, md: 5 }}
			bg="bg.glass"
			border="1px solid"
			borderColor="border.default"
			borderRadius="panel"
			boxShadow="soft"
			backdropFilter="blur(10px)"
			overflow="hidden"
		>
			<HStack
				gap={3}
				flexShrink={0}
				justify={{ base: 'flex-start', md: 'flex-start' }}
				pb={{ base: 3, md: 0 }}
				borderBottomWidth={{ base: '1px', md: '0' }}
				borderColor="border.default"
			>
				<Box bg="bg.brand" color="text.brand" borderRadius="full" p={2.5} lineHeight="1">
					<ChakraIcon as={FiUsers} boxSize={5} aria-hidden="true" />
				</Box>
				<Stack gap={0}>
					<Text fontSize="xs" color="text.muted">
						Mentors from
					</Text>
					<Text fontSize="sm" fontWeight="bold" color="text.primary">
						Top companies
					</Text>
				</Stack>
			</HStack>

			<Box
				minW={0}
				flex="1"
				overflowX={canAnimateBrands ? 'hidden' : 'auto'}
				className={canAnimateBrands ? undefined : 'hide-scrollbar'}
				css={{
					maskImage: canAnimateBrands
						? 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
						: 'none',
					WebkitMaskImage: canAnimateBrands
						? 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
						: 'none'
				}}
				aria-label="Companies represented by Shattak mentors"
			>
				<Box
					display="flex"
					alignItems="center"
					w="max-content"
					animation={canAnimateBrands ? `${mentorBrandScroll} 34s linear infinite` : undefined}
					willChange={canAnimateBrands ? 'transform' : undefined}
				>
					{[0, 1].map(copyIndex => (
						<HStack
							key={copyIndex}
							gap={{ base: 7, md: 10 }}
							pr={{ base: 7, md: 10 }}
							flexShrink={0}
							aria-hidden={copyIndex > 0 ? 'true' : undefined}
						>
							{mentorBrands.map(brand => (
								<HStack key={brand.name} gap={{ base: 2, md: 2.5 }} minW="max-content">
									<ChakraIcon as={brand.icon} boxSize={{ base: 6, md: 7 }} color={brand.color} aria-hidden="true" />
									<Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color="text.secondary">
										{brand.name}
									</Text>
								</HStack>
							))}
						</HStack>
					))}
				</Box>
			</Box>
		</Stack>
	);
};

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

	// Floating particles
	const FloatingParticle = ({
		delay,
		duration,
		xRange,
		yRange,
		reducedMotion,
		top,
		left,
		right,
		bottom
	}: FloatingParticleProps) => (
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
				reducedMotion
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
				<FloatingParticle
					delay={0}
					duration={8}
					xRange={[0, 100, 0]}
					yRange={[0, -80, 0]}
					reducedMotion={prefersReducedMotion}
					top="20%"
					left="15%"
				/>
				<FloatingParticle
					delay={2}
					duration={10}
					xRange={[0, -120, 0]}
					yRange={[0, 100, 0]}
					reducedMotion={prefersReducedMotion}
					top="60%"
					right="20%"
				/>
				<FloatingParticle
					delay={4}
					duration={12}
					xRange={[0, 80, 0]}
					yRange={[0, -100, 0]}
					reducedMotion={prefersReducedMotion}
					bottom="25%"
					left="25%"
				/>
				<FloatingParticle
					delay={1}
					duration={9}
					xRange={[0, -90, 0]}
					yRange={[0, 70, 0]}
					reducedMotion={prefersReducedMotion}
					top="40%"
					right="35%"
				/>
			</Box>

			<Container maxW="6xl" position="relative">
				<Stack direction={{ base: 'column', lg: 'row' }} align="center" gap={{ base: 8, lg: 10 }}>
					<Box
						as={motion.div}
						initial={{ opacity: 0, y: 32 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
						flex={{ base: 'unset', lg: 1 }}
						textAlign={{ base: 'center', lg: 'left' }}
					>
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
							<Text as="span" aria-hidden="true">
								👋
							</Text>
							<Text fontSize="sm" fontWeight="semibold" color="text.secondary">
								Pay After Certification
							</Text>
						</Box>

						<Heading
							as={motion.h1}
							fontSize={{ base: '2.4rem', md: '3.6rem', lg: '3rem' }}
							mt={3}
							lineHeight="display"
							fontFamily="display"
							fontWeight="semibold"
							initial="hidden"
							animate="show"
							variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
						>
							<Text
								as={motion.span}
								display="block"
								variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
							>
								Courses designed by professionals with{' '}
								<Box as="span" color="text.brand">
									5+ years of experience
								</Box>{' '}
								or{' '}
								<Box as="span" color="text.brand">
									₹12+ LPA packages.
								</Box>
							</Text>
						</Heading>

						<Text mt={4} color="text.muted" fontSize={{ base: 'sm', md: 'md' }} lineHeight="relaxed" maxW="xl">
							A completion-focused learning platform that keeps every student moving until they finish the course and
							learn something meaningful.
						</Text>

						<HStack
							as={motion.div}
							gap={{ base: 3, md: 4 }}
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
								size="md"
								h={{ base: '44px', md: '48px' }}
								w={{ base: '112px', md: '188px' }}
								flexShrink={0}
								boxSizing="border-box"
								bg="var(--chakra-gradients-brand-sunset)"
								color="text.inverse"
								_hover={{ transform: 'translateY(-3px)', boxShadow: 'primaryHover' }}
								borderRadius="full"
								border="2px solid transparent"
								px={{ base: 3, md: 7 }}
								fontSize={{ base: 'xs', md: 'sm' }}
								whiteSpace="nowrap"
								transition="all 0.3s ease"
								boxShadow="none"
								fontWeight="semibold"
							>
								<Link
									href="#courses"
									onClick={() =>
										trackCtaClicked({
											label: 'Explore Courses',
											location: 'home_hero',
											destination: '#courses',
											context: 'course_discovery'
										})
									}
								>
									Explore Courses
								</Link>
							</Button>
							<Button
								asChild
								size="md"
								h={{ base: '44px', md: '48px' }}
								w={{ base: '112px', md: '188px' }}
								flexShrink={0}
								boxSizing="border-box"
								borderRadius="full"
								px={{ base: 3, md: 7 }}
								bg="bg.card"
								border="2px solid"
								borderColor="border.brand"
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
								boxShadow="none"
								fontWeight="semibold"
							>
								<Link
									href="/roadmap"
									onClick={() =>
										trackCtaClicked({
											label: 'View Roadmap',
											location: 'home_hero',
											destination: '/roadmap',
											context: 'roadmap'
										})
									}
								>
									View Roadmap
								</Link>
							</Button>
						</HStack>
					</Box>

					<Box
						as={motion.div}
						initial={{ opacity: 0, y: 32 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
						display="block"
						flex={{ base: 'unset', lg: 1 }}
						w={{ base: '100%', md: '80%', lg: '48%' }}
						css={{ perspective: '900px' }}
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

									<HeroMedia prefersReducedMotion={prefersReducedMotion} />
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
				<MentorBrandMarquee prefersReducedMotion={prefersReducedMotion} />
			</Container>
		</Box>
	);
};

export default Hero;

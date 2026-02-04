'use client';

import { Box, Button, Container, HStack, Icon, Image, Stack, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiMessageCircle, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';

import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';
import { buildScheduleDisplayItems } from '~/lib/containers/course/utils/schedule';
import { courseDetailsMock } from '~/lib/containers/course/mock';

type BookingUnavailablePageProps = {
	sourceSlug: string;
};

const pulse = keyframes`
  0% { transform: scale(0.92); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.92); opacity: 0.5; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const MotionBox = motion(Box);
const MotionStack = motion(Stack);
const MotionHStack = motion(HStack);

const BookingUnavailablePage = ({ sourceSlug }: BookingUnavailablePageProps) => {
	const [status, setStatus] = useState<'checking' | 'full'>('checking');
	const [progress, setProgress] = useState(0);
	const [checkingSteps, setCheckingSteps] = useState([
		{ id: 1, text: 'Connecting to server...', status: 'pending' },
		{ id: 2, text: 'Checking seat availability...', status: 'pending' },
		{ id: 3, text: 'Verifying booking status...', status: 'pending' },
		{ id: 4, text: 'Finalizing results...', status: 'pending' }
	]);

	useEffect(() => {
		const progressInterval = setInterval(() => {
			setProgress(prev => {
				if (prev >= 100) {
					clearInterval(progressInterval);
					return 100;
				}
				return prev + 1;
			});
		}, 35);

		const stepTimers = [
			setTimeout(() => {
				setCheckingSteps(prev => prev.map(step => (step.id === 1 ? { ...step, status: 'completed' } : step)));
			}, 700),
			setTimeout(() => {
				setCheckingSteps(prev => prev.map(step => (step.id === 2 ? { ...step, status: 'completed' } : step)));
			}, 1400),
			setTimeout(() => {
				setCheckingSteps(prev => prev.map(step => (step.id === 3 ? { ...step, status: 'completed' } : step)));
			}, 2200),
			setTimeout(() => {
				setCheckingSteps(prev => prev.map(step => (step.id === 4 ? { ...step, status: 'completed' } : step)));
			}, 3000)
		];

		const timer = setTimeout(() => setStatus('full'), 3600);

		return () => {
			clearTimeout(timer);
			stepTimers.forEach(clearTimeout);
			clearInterval(progressInterval);
		};
	}, []);

	const startSession = useMemo(() => {
		const item = buildScheduleDisplayItems(
			courseDetailsMock.schedule.slice(0, 1),
			courseDetailsMock.durationHours,
			courseDetailsMock.durationMinutes
		)[0];
		if (!item) {
			return 'Starting soon';
		}
		const startTime = item.timeRange.split(' to ')[0] ?? item.timeRange;
		return `Starting From ${item.badge.day} ${item.badge.month} - ${startTime}`;
	}, []);

	const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? '#';

	return (
		<>
			<Header />
			<main>
				<Box
					as="section"
					py={{ base: 14, md: 20 }}
					bgGradient="var(--chakra-gradients-cta-surface)"
					_dark={{ bgGradient: 'var(--chakra-gradients-cta-surface-dark)' }}
					position="relative"
					overflow="hidden"
					minH="70vh"
					display="flex"
					alignItems="center"
				>
					{/* Animated Background Orbs */}
					<Box position="absolute" inset="0" pointerEvents="none">
						<MotionBox
							position="absolute"
							top={{ base: '-120px', lg: '-160px' }}
							left={{ base: '-120px', lg: '-140px' }}
							w={{ base: '280px', md: '340px' }}
							h={{ base: '280px', md: '340px' }}
							borderRadius="full"
							bgGradient="var(--chakra-gradients-hero-cool-orb)"
							_dark={{ bgGradient: 'var(--chakra-gradients-hero-cool-orb-dark)' }}
							opacity={0.4}
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.4, 0.6, 0.4]
							}}
							transition={{
								duration: 4,
								repeat: Infinity,
								ease: 'easeInOut'
							}}
						/>
						<MotionBox
							position="absolute"
							bottom={{ base: '-140px', lg: '-170px' }}
							right={{ base: '-120px', lg: '-160px' }}
							w={{ base: '300px', md: '360px' }}
							h={{ base: '300px', md: '360px' }}
							borderRadius="full"
							bgGradient="var(--chakra-gradients-hero-warm-orb)"
							_dark={{ bgGradient: 'var(--chakra-gradients-hero-warm-orb-dark)' }}
							opacity={0.35}
							animate={{
								scale: [1, 1.15, 1],
								opacity: [0.35, 0.55, 0.35]
							}}
							transition={{
								duration: 5,
								repeat: Infinity,
								ease: 'easeInOut',
								delay: 0.5
							}}
						/>
					</Box>

					<Container maxW="5xl" position="relative">
						<MotionBox
							bg="bg.card"
							borderRadius="card"
							border="1px solid"
							borderColor="border.default"
							p={{ base: 7, md: 9 }}
							boxShadow="card"
							maxW="3xl"
							mx="auto"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<Stack spacing={{ base: 6, md: 7 }} textAlign="center" align="center">
								{/* Course Info Card */}
								<MotionBox
									bg="bg.accent"
									borderRadius="xl"
									border="1px solid"
									borderColor="border.accentSoft"
									p={{ base: 3, md: 4 }}
									w="full"
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.5, delay: 0.2 }}
								>
									<HStack spacing={4} align="center" justify="center" flexWrap="wrap">
										<MotionBox
											w={{ base: '64px', md: '72px' }}
											h={{ base: '64px', md: '72px' }}
											borderRadius="lg"
											bg="bg.card"
											display="flex"
											alignItems="center"
											justifyContent="center"
											whileHover={{ scale: 1.05, rotate: 5 }}
											transition={{ duration: 0.3 }}
										>
											<Image src={courseDetailsMock.thumbnailImage} alt="Course preview" w="60%" h="60%" />
										</MotionBox>
										<Stack
											spacing={1}
											align={{ base: 'center', md: 'flex-start' }}
											textAlign={{ base: 'center', md: 'left' }}
										>
											<Text fontWeight="semibold">{courseDetailsMock.title}</Text>
											<HStack spacing={2} fontSize="sm" color="text.muted">
												<Icon as={FiClock} boxSize={3.5} />
												<Text>{startSession}</Text>
											</HStack>
										</Stack>
									</HStack>
								</MotionBox>

								{/* Status Icon with Enhanced Animation */}
								<MotionBox
									w="80px"
									h="80px"
									borderRadius="full"
									bg="bg.card"
									mt="8px"
									border="1px solid"
									borderColor="border.default"
									display="flex"
									alignItems="center"
									justifyContent="center"
									position="relative"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 200 }}
								>
									{/* Multiple rotating rings */}
									<Box
										position="absolute"
										inset="-8px"
										borderRadius="full"
										border="3px solid"
										borderColor="border.accent"
										borderTopColor="transparent"
										opacity={0.8}
										animation={status === 'checking' ? `${spin} 2.4s linear infinite` : undefined}
									/>
									<Box
										position="absolute"
										inset="-14px"
										borderRadius="full"
										border="2px solid"
										borderColor="border.accent"
										borderBottomColor="transparent"
										opacity={0.4}
										animation={status === 'checking' ? `${spin} 3.6s linear infinite reverse` : undefined}
									/>

									{/* Pulsing background glow */}
									{status === 'checking' && (
										<Box
											position="absolute"
											inset="-4px"
											borderRadius="full"
											bg="primary"
											opacity={0.1}
											animation={`${pulse} 2.2s ease-in-out infinite`}
										/>
									)}

									<AnimatePresence mode="wait">
										{status === 'checking' ? (
											<MotionBox
												key="checking"
												initial={{ scale: 0, rotate: -180 }}
												animate={{ scale: 1, rotate: 0 }}
												exit={{ scale: 0, rotate: 180 }}
												transition={{ duration: 0.4 }}
											>
												<Icon
													as={FiUsers}
													boxSize={8}
													color="primary"
													animation={`${pulse} 1.9s ease-in-out infinite`}
												/>
											</MotionBox>
										) : (
											<MotionBox
												key="full"
												initial={{ scale: 0, rotate: -180 }}
												animate={{ scale: 1, rotate: 0 }}
												transition={{ duration: 0.4 }}
											>
												<Icon as={FiAlertCircle} boxSize={8} color="red.500" />
											</MotionBox>
										)}
									</AnimatePresence>
								</MotionBox>

								{/* Progress Bar (only during checking) */}
								<AnimatePresence>
									{status === 'checking' && (
										<MotionBox
											w="full"
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.3 }}
										>
											<Box w="full" h="8px" bg="bg.muted" borderRadius="full" overflow="hidden" position="relative">
												<MotionBox
													h="full"
													bg="primary"
													borderRadius="full"
													initial={{ width: '0%' }}
													animate={{ width: `${progress}%` }}
													transition={{ duration: 0.3 }}
													position="relative"
													overflow="hidden"
												>
													<Box
														position="absolute"
														inset={0}
														bgGradient="linear(to-r, transparent, rgba(255,255,255,0.3), transparent)"
														animation={`${shimmer} 2.2s infinite`}
													/>
												</MotionBox>
											</Box>
											<Text fontSize="xs" color="text.muted" mt={1}>
												{progress}% complete
											</Text>
										</MotionBox>
									)}
								</AnimatePresence>

								{/* Checking Steps */}
								<AnimatePresence>
									{status === 'checking' && (
										<MotionStack
											spacing={2}
											w="full"
											align="stretch"
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.4, delay: 0.2 }}
										>
											{checkingSteps.map((step, index) => (
												<MotionBox
													key={step.id}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.3, delay: index * 0.1 }}
												>
													<HStack
														spacing={3}
														p={3}
														bg="bg.muted"
														borderRadius="lg"
														border="1px solid"
														borderColor={step.status === 'completed' ? 'border.accent' : 'border.default'}
													>
														<Box
															w="20px"
															h="20px"
															borderRadius="full"
															bg={step.status === 'completed' ? 'success.500' : 'bg.card'}
															border="2px solid"
															borderColor={step.status === 'completed' ? 'success.500' : 'border.default'}
															display="flex"
															alignItems="center"
															justifyContent="center"
															flexShrink={0}
														>
															{step.status === 'completed' && (
																<motion.div
																	initial={{ scale: 0 }}
																	animate={{ scale: 1 }}
																	transition={{ duration: 0.3, type: 'spring' }}
																>
																	<Icon as={FiCheckCircle} color="white" boxSize={3} />
																</motion.div>
															)}
															{step.status === 'pending' && (
																<Box
																	w="8px"
																	h="8px"
																	borderRadius="full"
																	bg="text.muted"
																	animation={`${pulse} 1s ease-in-out infinite`}
																/>
															)}
														</Box>
														<Text fontSize="sm" flex={1} textAlign="left">
															{step.text}
														</Text>
													</HStack>
												</MotionBox>
											))}
										</MotionStack>
									)}
								</AnimatePresence>

								{/* Status Message */}
								<AnimatePresence mode="wait">
									{status === 'checking' ? (
										<MotionStack
											key="checking-message"
											spacing={2}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.4 }}
										>
											<Text fontSize="xl" fontWeight="bold">
												Checking availability...
											</Text>
											<Text color="text.muted" fontSize="sm">
												Please wait while we confirm seat availability.
											</Text>
										</MotionStack>
									) : (
										<MotionStack
											key="full-message"
											spacing={2}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.4 }}
										>
											<Text fontSize="xl" fontWeight="bold">
												All Seats are Fully Booked!
											</Text>
											<Text color="text.muted" fontSize="sm">
												Sorry, all spots for this course are currently full. Don&apos;t miss out on future updates!
											</Text>
										</MotionStack>
									)}
								</AnimatePresence>

								{/* WhatsApp CTA - Appears after checking */}
								<AnimatePresence>
									{status === 'full' && (
										<MotionBox
											w="full"
											initial={{ opacity: 0, scale: 0.8, y: 20 }}
											animate={{ opacity: 1, scale: 1, y: 0 }}
											transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
										>
											<Box
												bg="bg.success"
												borderRadius="xl"
												border="1px solid"
												borderColor="border.default"
												p={{ base: 5, md: 6 }}
												w="full"
												position="relative"
												overflow="hidden"
											>
												{/* Animated gradient background */}
												<Box
													position="absolute"
													inset={0}
													bgGradient="linear(to-br, transparent, rgba(34, 197, 94, 0.05))"
													animation={`${float} 3s ease-in-out infinite`}
												/>

												<Stack spacing={4} align="center" textAlign="center" position="relative">
													<MotionBox
														w="52px"
														h="52px"
														borderRadius="full"
														bg="success.500"
														display="flex"
														alignItems="center"
														justifyContent="center"
														animate={{
															scale: [1, 1.1, 1]
														}}
														transition={{
															duration: 2,
															repeat: Infinity,
															ease: 'easeInOut'
														}}
													>
														<Icon as={FiMessageCircle} color="white" boxSize={6} />
													</MotionBox>

													<Stack spacing={1}>
														<Text fontWeight="bold" fontSize="lg">
															Join Our WhatsApp Group
														</Text>
														<Text fontSize="sm" color="text.muted">
															Get instant notifications about new batches and seat availability
														</Text>
													</Stack>

													<MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} w="full">
														<Button
															asChild
															borderRadius="full"
															bg="success.600"
															color="white"
															_dark={{ bg: 'white', color: 'black', _hover: { bg: 'gray.100' } }}
															_hover={{ bg: 'success.700' }}
															px={8}
															py={6}
															fontSize="md"
															fontWeight="semibold"
															w={{ base: 'full', sm: 'auto' }}
															animation={`${glow} 2s ease-in-out infinite`}
														>
															<Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
																Join WhatsApp Group {'->'}
															</Link>
														</Button>
													</MotionBox>

													<HStack spacing={4} pt={2} fontSize="xs" color="text.muted">
														<HStack spacing={1}>
															<Icon as={FiUsers} boxSize={3} />
															<Text>500+ members</Text>
														</HStack>
														<Text>-</Text>
														<Text>Instant updates</Text>
													</HStack>
												</Stack>
											</Box>
										</MotionBox>
									)}
								</AnimatePresence>

								{/* Source Footer */}
								<MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
									<Text fontSize="xs" color="text.muted">
										Source: {sourceSlug}
									</Text>
								</MotionBox>
							</Stack>
						</MotionBox>
					</Container>
				</Box>
			</main>
			<Footer />
		</>
	);
};

export default BookingUnavailablePage;


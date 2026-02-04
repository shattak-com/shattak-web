'use client';

import { Box, Container, Heading, HStack, Icon, SimpleGrid, Stack, Text, useBreakpointValue } from '@chakra-ui/react';
import Image from 'next/image';
import { FiHeart, FiStar } from 'react-icons/fi';

import Reveal from '~/lib/components/Reveal';

export type TestimonialItem = {
	id: string;
	name: string;
	institution: string;
	rating: number;
	body: string;
	avatar?: string;
	likes?: number;
};

type TestimonialsProps = {
	items: TestimonialItem[];
	title?: string;
	subtitle?: string;
	sectionId?: string;
	background?: string;
	cardBackgrounds?: string[];
	variant?: 'classic' | 'modern';
	containerMaxW?: string;
};

const defaultCardBackgrounds = ['bg.subtle', 'bg.accent', 'bg.success'];

const Testimonials = ({
	items,
	title = 'What They Said ?',
	subtitle = 'Stories from learners who joined our live classes.',
	sectionId = 'testimonials',
	background = 'bg.surface',
	cardBackgrounds = defaultCardBackgrounds,
	variant = 'classic',
	containerMaxW = '6xl'
}: TestimonialsProps) => {
	const isDesktop = useBreakpointValue({ base: false, lg: true }) ?? false;

	const getInitials = (name: string) => name.trim().slice(0, 1).toUpperCase();
	const isModern = variant === 'modern';
	const modernOrbs = [
		'var(--chakra-gradients-hero-cool-orb)',
		'var(--chakra-gradients-hero-warm-orb)',
		'var(--chakra-gradients-hero-glow)'
	];

	const ModernCard = ({
		testimonial,
		index,
		isMobile
	}: {
		testimonial: TestimonialItem;
		index: number;
		isMobile?: boolean;
	}) => (
		<Box
			bg="bg.card"
			borderRadius="card"
			p={isMobile ? 5 : 6}
			display="flex"
			flexDirection="column"
			minH={{ base: '240px', md: '260px', lg: '300px' }}
			w={isMobile ? { base: '280px', sm: '320px' } : undefined}
			flex={isMobile ? '0 0 auto' : undefined}
			border="1px solid"
			borderColor="border.default"
			boxShadow="soft"
			position="relative"
			overflow="hidden"
			transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
			_hover={{ transform: 'translateY(-2px)', boxShadow: 'card', borderColor: 'border.brandSoft' }}
		>
			<Box position="absolute" top="0" left="0" right="0" h="4px" bgGradient="var(--chakra-gradients-brand-accent)" />
			<Box
				position="absolute"
				top="-28px"
				right="-28px"
				w="110px"
				h="110px"
				borderRadius="full"
				bgGradient={modernOrbs[index % modernOrbs.length]}
				opacity={{ base: 0.25, _dark: 0.14 }}
			/>
			<HStack spacing={3} mb={4} align="center">
				<HStack
					spacing={2}
					px={3}
					py={1}
					borderRadius="full"
					bg="bg.accent"
					border="1px solid"
					borderColor="border.accentSoft"
				>
					<Icon as={FiStar} color="icon.warning" boxSize={3.5} />
					<Text fontWeight="semibold" fontSize="sm">
						{testimonial.rating}
					</Text>
				</HStack>
				{typeof testimonial.likes === 'number' ? (
					<HStack
						spacing={1.5}
						ml="auto"
						color="text.muted"
						px={2.5}
						py={1}
						borderRadius="full"
						border="1px solid"
						borderColor="border.default"
					>
						<Icon as={FiHeart} boxSize={3.5} />
						<Text fontSize="xs" fontWeight="medium">
							{testimonial.likes}
						</Text>
					</HStack>
				) : null}
			</HStack>
			<Text fontSize="sm" color="text.secondary" lineHeight="relaxed" mb={6} lineClamp={8}>
				{testimonial.body}
			</Text>
			<HStack spacing={3} mt="auto">
				{testimonial.avatar ? (
					<Box
						position="relative"
						w="46px"
						h="46px"
						borderRadius="full"
						overflow="hidden"
						border="2px solid"
						borderColor="border.brandSoft"
						boxShadow="soft"
					>
						<Image src={testimonial.avatar} alt={testimonial.name} fill sizes="46px" style={{ objectFit: 'cover' }} />
					</Box>
				) : (
					<Box
						w="46px"
						h="46px"
						borderRadius="full"
						bg="bg.subtle"
						border="1px solid"
						borderColor="border.default"
						boxShadow="soft"
						display="flex"
						alignItems="center"
						justifyContent="center"
					>
						<Text fontWeight="semibold">{getInitials(testimonial.name)}</Text>
					</Box>
				)}
				<Box>
					<Text fontWeight="semibold">{testimonial.name}</Text>
					<Text fontSize="sm" color="text.muted">
						{testimonial.institution}
					</Text>
				</Box>
			</HStack>
		</Box>
	);

	return (
		<Box as="section" id={sectionId} py={{ base: 14, md: 20 }} bg={background}>
			<Container maxW={containerMaxW}>
				<Stack spacing={8}>
					<Stack spacing={2}>
						<Heading fontSize={{ base: 'xl', md: '2xl' }} lineHeight="title" letterSpacing="subtle">
							{title}
						</Heading>
						{subtitle ? <Text color="text.muted">{subtitle}</Text> : null}
					</Stack>

					{isDesktop ? (
						<SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 10, md: 12, lg: 14 }}>
							{items.map((testimonial, index) => (
								<Reveal key={testimonial.id} delay={index * 0.06} hover hoverLift={6}>
									{isModern ? (
										<ModernCard testimonial={testimonial} index={index} />
									) : (
										<Box
											bg={cardBackgrounds[index % cardBackgrounds.length]}
											borderRadius="card"
											p={6}
											display="flex"
											flexDirection="column"
											h={{ base: 'auto', md: '220px', lg: '350px' }}
											border="1px solid"
											borderColor="border.default"
											boxShadow="card"
										>
											<HStack spacing={2} mb={4}>
												<Icon as={FiStar} color="icon.warning" />
												<Text fontWeight="semibold">{testimonial.rating}</Text>
												{typeof testimonial.likes === 'number' ? (
													<HStack spacing={1} ml="auto" color="text.muted">
														<Icon as={FiHeart} boxSize={3.5} />
														<Text fontSize="xs" fontWeight="medium">
															{testimonial.likes}
														</Text>
													</HStack>
												) : null}
											</HStack>
											<Text fontSize="sm" color="text.secondary" mb={6} lineClamp={12}>
												{testimonial.body}
											</Text>
											<HStack spacing={3} mt="auto">
												{testimonial.avatar ? (
													<Box
														position="relative"
														w="44px"
														h="44px"
														borderRadius="full"
														overflow="hidden"
														border="2px solid"
														borderColor="bg.card"
														boxShadow="soft"
													>
														<Image
															src={testimonial.avatar}
															alt={testimonial.name}
															fill
															sizes="44px"
															style={{ objectFit: 'cover' }}
														/>
													</Box>
												) : (
													<Box
														w="44px"
														h="44px"
														borderRadius="full"
														bg="bg.card"
														border="1px solid"
														borderColor="border.default"
														boxShadow="soft"
														display="flex"
														alignItems="center"
														justifyContent="center"
													>
														<Text fontWeight="semibold">{getInitials(testimonial.name)}</Text>
													</Box>
												)}
												<Box>
													<Text fontWeight="semibold">{testimonial.name}</Text>
													<Text fontSize="sm" color="text.muted">
														{testimonial.institution}
													</Text>
												</Box>
											</HStack>
										</Box>
									)}
								</Reveal>
							))}
						</SimpleGrid>
					) : (
						<Reveal>
							<Box
								overflowX="auto"
								overflowY="hidden"
								scrollSnapType="x mandatory"
								pb={3}
								className="hide-scrollbar"
								sx={{
									'&::-webkit-scrollbar': { height: '0px' },
									scrollbarWidth: 'none',
									msOverflowStyle: 'none'
								}}
							>
								<HStack spacing={4} w="max-content" pr={{ base: 6, md: 0 }} align="stretch">
									{items.map((testimonial, index) => (
										<Box key={testimonial.id} scrollSnapAlign="start">
											{isModern ? (
												<ModernCard testimonial={testimonial} index={index} isMobile />
											) : (
												<Box
													bg={cardBackgrounds[index % cardBackgrounds.length]}
													borderRadius="card"
													p={6}
													display="flex"
													flexDirection="column"
													h={{ base: '230px', sm: '240px' }}
													w={{ base: '280px', sm: '320px' }}
													flex="0 0 auto"
													border="1px solid"
													borderColor="border.default"
													boxShadow="card"
												>
													<HStack spacing={2} mb={4}>
														<Icon as={FiStar} color="icon.warning" />
														<Text fontWeight="semibold">{testimonial.rating}</Text>
														{typeof testimonial.likes === 'number' ? (
															<HStack spacing={1} ml="auto" color="text.muted">
																<Icon as={FiHeart} boxSize={3.5} />
																<Text fontSize="xs" fontWeight="medium">
																	{testimonial.likes}
																</Text>
															</HStack>
														) : null}
													</HStack>
													<Text fontSize="sm" color="text.secondary" mb={6} lineClamp={3}>
														{testimonial.body}
													</Text>
													<HStack spacing={3} mt="auto">
														{testimonial.avatar ? (
															<Box
																position="relative"
																w="40px"
																h="40px"
																borderRadius="full"
																overflow="hidden"
																border="2px solid"
																borderColor="bg.card"
																boxShadow="soft"
															>
																<Image
																	src={testimonial.avatar}
																	alt={testimonial.name}
																	fill
																	sizes="40px"
																	style={{ objectFit: 'cover' }}
																/>
															</Box>
														) : (
															<Box
																w="40px"
																h="40px"
																borderRadius="full"
																bg="bg.card"
																border="1px solid"
																borderColor="border.default"
																boxShadow="soft"
																display="flex"
																alignItems="center"
																justifyContent="center"
															>
																<Text fontWeight="semibold">{getInitials(testimonial.name)}</Text>
															</Box>
														)}
														<Box>
															<Text fontWeight="semibold">{testimonial.name}</Text>
															<Text fontSize="sm" color="text.muted">
																{testimonial.institution}
															</Text>
														</Box>
													</HStack>
												</Box>
											)}
										</Box>
									))}
								</HStack>
							</Box>
						</Reveal>
					)}
				</Stack>
			</Container>
		</Box>
	);
};

export default Testimonials;

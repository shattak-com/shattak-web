'use client';

import { Box, Container, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';

import type { CourseAudienceCard } from '~/lib/containers/course/types';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

type CourseAudienceProps = {
	audience: CourseAudienceCard[];
};

const toneStyles = {
	success: { border: 'border.brandSoft', glow: 'var(--chakra-gradients-hero-cool-orb)' },
	accent: { border: 'border.accentSoft', glow: 'var(--chakra-gradients-hero-cool-orb)' },
	warning: { border: 'border.brandSoft', glow: 'var(--chakra-gradients-hero-warm-orb)' },
	info: { border: 'border.default', glow: 'var(--chakra-gradients-hero-warm-orb)' }
} as const;

const CourseAudience = ({ audience }: CourseAudienceProps) => (
	<Box as="section" py={{ base: 10, md: 14 }} bg="bg.surface">
		<Container maxW="7xl">
			<Stack spacing={6}>
				<SectionHeader title="You should join this course if you" />
				<SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 4, md: 5 }}>
					{audience.map(card => {
						const styles = toneStyles[card.tone ?? 'info'];

						return (
							<Box
								key={card.id}
								bg="bg.card"
								borderRadius="card"
								border="1px solid"
								borderColor={styles.border}
								p={5}
								boxShadow="soft"
								position="relative"
								overflow="hidden"
								transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
								_hover={{ transform: 'translateY(-2px)', boxShadow: 'card', borderColor: 'border.brand' }}
							>
								<Box
									position="absolute"
									top="-24px"
									right="-24px"
									w="96px"
									h="96px"
									borderRadius="full"
									bgGradient={styles.glow}
									opacity={{ base: 0.2, _dark: 0.12 }}
								/>
								<Stack spacing={4}>
									<Text fontWeight="semibold" fontSize="md">
										{card.title}
									</Text>
									<Stack spacing={2}>
										{card.bullets.map(bullet => (
											<HStack key={bullet} spacing={3} align="start">
												<Box
													w="22px"
													h="22px"
													borderRadius="full"
													bg="bg.accent"
													border="1px solid"
													borderColor="border.accentSoft"
													display="flex"
													alignItems="center"
													justifyContent="center"
													flexShrink={0}
												>
													<Icon as={FiCheck} color="icon.accent" boxSize={3} />
												</Box>
												<Text fontSize="sm" color="text.secondary">
													{bullet}
												</Text>
											</HStack>
										))}
									</Stack>
								</Stack>
							</Box>
						);
					})}
				</SimpleGrid>
			</Stack>
		</Container>
	</Box>
);

export default CourseAudience;

'use client';

import { Box, Container, HStack, Spinner, Stack, Text } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const shimmer = keyframes`
	100% {
		transform: translateX(100%);
	}
`;

type SkeletonBlockProps = BoxProps;

export const SkeletonBlock = ({ borderRadius = 'soft', ...props }: SkeletonBlockProps) => (
	<Box
		aria-hidden="true"
		bg="bg.subtle"
		borderRadius={borderRadius}
		overflow="hidden"
		position="relative"
		_before={{
			animation: `${shimmer} 1.4s ease-in-out infinite`,
			background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.42), transparent)',
			content: '""',
			inset: 0,
			position: 'absolute',
			transform: 'translateX(-100%)'
		}}
		_dark={{
			bg: 'gray.800',
			_before: {
				background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)'
			}
		}}
		{...props}
	/>
);

export const AuthPageSkeleton = () => (
	<Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '0.92fr 1.08fr' }} gap={{ base: 4, lg: 4 }}>
		<Box border="1px solid" borderColor="border.default" borderRadius="2xl" bg="bg.card" p={{ base: 6, md: 10 }}>
			<Stack gap={5}>
				<SkeletonBlock h="24px" w="128px" borderRadius="full" />
				<Stack gap={3}>
					<SkeletonBlock h="44px" w="78%" />
					<SkeletonBlock h="44px" w="56%" />
				</Stack>
				<Stack gap={2}>
					<SkeletonBlock h="14px" w="92%" />
					<SkeletonBlock h="14px" w="74%" />
				</Stack>
				<SkeletonBlock h="1px" w="100%" borderRadius="none" />
				<SkeletonBlock h="44px" w="320px" maxW="100%" borderRadius="full" />
				<SkeletonBlock h="12px" w="70%" alignSelf="center" />
			</Stack>
		</Box>
		<Box border="1px solid" borderColor="border.default" borderRadius="2xl" bg="bg.subtle" p={{ base: 5, md: 7 }}>
			<Stack gap={4}>
				<SkeletonBlock h="14px" w="152px" />
				<SkeletonBlock h="108px" w="100%" borderRadius="xl" />
				<HStack gap={3}>
					<SkeletonBlock h="92px" flex="1" borderRadius="xl" />
					<SkeletonBlock h="92px" flex="1" borderRadius="xl" />
				</HStack>
				<SkeletonBlock h="14px" w="164px" />
				<Stack gap={2}>
					<SkeletonBlock h="58px" w="100%" borderRadius="lg" />
					<SkeletonBlock h="58px" w="100%" borderRadius="lg" />
				</Stack>
			</Stack>
		</Box>
	</Box>
);

export const OnboardingStepSkeleton = () => (
	<Stack gap={6}>
		<Stack gap={2}>
			<SkeletonBlock h="14px" w="120px" />
			<SkeletonBlock h="42px" w="100%" borderRadius="md" />
		</Stack>
		<Stack gap={2}>
			<SkeletonBlock h="14px" w="150px" />
			<SkeletonBlock h="42px" w="100%" borderRadius="md" />
		</Stack>
		<Stack gap={3}>
			<HStack gap={3} flexWrap="wrap">
				{Array.from({ length: 10 }, (_, index) => (
					<SkeletonBlock key={index} h="36px" w={index % 3 === 0 ? '138px' : '104px'} borderRadius="full" />
				))}
			</HStack>
		</Stack>
		<SkeletonBlock h="44px" w="156px" borderRadius="full" />
	</Stack>
);

type BlockingProgressOverlayProps = {
	title: string;
	message?: string;
};

export const BlockingProgressOverlay = ({ title, message }: BlockingProgressOverlayProps) => (
	<Box
		position="fixed"
		inset={0}
		zIndex={1600}
		bg="overlay.80"
		backdropFilter="blur(10px)"
		display="flex"
		alignItems="center"
		justifyContent="center"
		px={5}
		_dark={{ bg: 'overlayDark.60' }}
	>
		<Box
			bg="bg.card"
			border="1px solid"
			borderColor="border.default"
			borderRadius="2xl"
			boxShadow="elevated"
			p={{ base: 5, md: 6 }}
			w="min(100%, 380px)"
		>
			<HStack gap={4} align="flex-start">
				<Box
					boxSize="44px"
					borderRadius="full"
					bg="primary"
					color="text.inverse"
					display="flex"
					alignItems="center"
					justifyContent="center"
					flexShrink={0}
				>
					<Spinner size="sm" />
				</Box>
				<Box>
					<Text fontWeight="bold">{title}</Text>
					{message ? (
						<Text mt={1} color="text.muted" fontSize="sm" lineHeight="relaxed">
							{message}
						</Text>
					) : null}
				</Box>
			</HStack>
		</Box>
	</Box>
);

export const ProfilePageSkeleton = () => (
	<Container maxW="3xl" py={{ base: 12, md: 16 }}>
		<Stack gap={8}>
			<HStack gap={5}>
				<SkeletonBlock boxSize="72px" borderRadius="full" />
				<Stack gap={3} flex="1">
					<SkeletonBlock h="28px" w="220px" />
					<SkeletonBlock h="16px" w="280px" maxW="100%" />
				</Stack>
			</HStack>
			<SkeletonBlock h="148px" w="100%" borderRadius="card" />
			<SkeletonBlock h="220px" w="100%" borderRadius="card" />
		</Stack>
	</Container>
);

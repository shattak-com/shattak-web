'use client';

import { Badge, Box, Button, HStack, IconButton, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import { getAnalyticsConsentStatus, grantAnalyticsConsent, revokeAnalyticsConsent } from '~/lib/analytics/mixpanel';

const ShieldIcon = () => (
	<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
		<path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2zm-1 13l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z" />
	</svg>
);

const AnalyticsConsentBanner = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const bannerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const consentStatus = getAnalyticsConsentStatus();
		if (consentStatus === null) {
			setIsVisible(true);
			// Slight delay so CSS transition fires after mount
			requestAnimationFrame(() => setIsMounted(true));
		}
	}, []);

	useEffect(() => {
		const openBanner = () => {
			setIsVisible(true);
			requestAnimationFrame(() => setIsMounted(true));
		};
		window.addEventListener('shattak:open-analytics-consent', openBanner);
		return () => window.removeEventListener('shattak:open-analytics-consent', openBanner);
	}, []);

	const handleDismiss = (action: 'grant' | 'revoke' | 'defer') => {
		setIsMounted(false);
		setTimeout(() => {
			if (action === 'grant') grantAnalyticsConsent();
			if (action === 'revoke') revokeAnalyticsConsent();
			setIsVisible(false);
		}, 250); // matches transition duration
	};

	if (!isVisible) return null;

	return (
		<Box
			ref={bannerRef}
			position="fixed"
			bottom={{ base: 3, md: 4 }}
			left="0"
			right="0"
			zIndex="modal"
			bg="bg.card"
			border="1px solid"
			borderColor="border.accentSoft"
			borderRadius="card"
			boxShadow="elevated"
			backdropFilter="blur(12px)"
			p={{ base: 3, md: 4 }}
			maxW={{ base: 'calc(100% - 16px)', md: '760px' }}
			mx="auto"
			role="region"
			aria-label="Analytics consent"
			aria-live="polite"
			style={{
				transform: isMounted ? 'translateY(0)' : 'translateY(16px)',
				opacity: isMounted ? 1 : 0,
				transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease'
			}}
		>
			<Stack
				direction={{ base: 'column', md: 'row' }}
				gap={{ base: 3, md: 4 }}
				align={{ base: 'stretch', md: 'center' }}
			>
				{/* Text content */}
				<Stack gap={1.5} flex="1" minW={0}>
					<HStack gap={2}>
						<Badge
							variant="subtle"
							bg="bg.accent"
							color="text.primary"
							border="1px solid"
							borderColor="border.accentSoft"
							borderRadius="full"
							px={2.5}
							py={0.5}
							fontSize="xs"
							display="flex"
							alignItems="center"
							gap={1.5}
						>
							<ShieldIcon />
							Analytics
						</Badge>
						<Text fontWeight="semibold" color="text.primary" lineHeight="short">
							Help us improve Shattak
						</Text>
					</HStack>
					<Text fontSize="sm" color="text.secondary" lineHeight="relaxed">
						We use privacy-first analytics to understand how learners discover courses. You can update this anytime
						under{' '}
						<Text as="span" color="text.primary" fontWeight="medium">
							Analytics Preferences
						</Text>{' '}
						in the footer.
					</Text>
				</Stack>

				{/* Actions */}
				<HStack
					gap={2}
					justify={{ base: 'flex-start', md: 'flex-end' }}
					flexShrink={0}
					w={{ base: 'full', md: 'auto' }}
				>
					<Button
						size="sm"
						flex={{ base: 1, md: 'none' }}
						borderRadius="full"
						bg="primary"
						color="text.inverse"
						_hover={{ bg: 'primaryHover', boxShadow: '0 0 0 3px var(--chakra-colors-primary)20' }}
						transition="all 0.15s ease"
						onClick={() => handleDismiss('grant')}
					>
						Allow Analytics
					</Button>
					<Button
						size="sm"
						flex={{ base: 1, md: 'none' }}
						borderRadius="full"
						variant="outline"
						borderColor="border.default"
						color="text.primary"
						_hover={{ bg: 'bg.subtle' }}
						onClick={() => handleDismiss('revoke')}
					>
						Decline
					</Button>
					<IconButton
						aria-label="Dismiss for now"
						size="sm"
						variant="ghost"
						borderRadius="full"
						color="text.tertiary"
						_hover={{ bg: 'bg.subtle', color: 'text.secondary' }}
						onClick={() => handleDismiss('defer')}
						icon={
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
								<path d="M18 6L6 18M6 6l12 12" />
							</svg>
						}
					/>
				</HStack>
			</Stack>
		</Box>
	);
};

export default AnalyticsConsentBanner;

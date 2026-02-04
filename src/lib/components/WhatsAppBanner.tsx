'use client';

import { Box, Button, Container, Grid, HStack, Icon, Text } from '@chakra-ui/react';
import Link from 'next/link';
import type { IconType } from 'react-icons';
import { FiMessageCircle } from 'react-icons/fi';

import Reveal from '~/lib/components/Reveal';

type WhatsAppBannerProps = {
	title?: string;
	ctaLabel?: string;
	ctaUrl?: string;
	icon?: IconType;
};

const WhatsAppBanner = ({
	title = 'For More Updates, Join Us On WhatsApp',
	ctaLabel = 'Join Now',
	ctaUrl,
	icon = FiMessageCircle
}: WhatsAppBannerProps) => {
	const whatsappUrl = ctaUrl ?? process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? '';

	return (
		<Box as="section" id="whatsapp" py={{ base: 10, md: 12 }}>
			<Container maxW="6xl">
				<Reveal>
					<Box
						bg="bg.inverse"
						borderRadius={{ base: 'soft', md: 'panel' }}
						px={{ base: 5, md: 8 }}
						py={{ base: 5, md: 7 }}
						_dark={{ bg: 'bg.card', border: '1px solid', borderColor: 'border.subtle', boxShadow: 'soft' }}
					>
						<Grid templateColumns={{ base: '1fr auto', md: '1fr auto' }} gap={{ base: 4, md: 6 }} alignItems="center">
							<HStack spacing={3} minW={0}>
								<Icon as={icon} color="icon.success" boxSize={{ base: 9, md: 10 }} />
								<Text
									color="text.inverse"
									fontWeight="semibold"
									fontSize={{ base: 'sm', md: 'md' }}
									lineHeight="banner"
									_dark={{ color: 'text.primary' }}
								>
									{title}
								</Text>
							</HStack>
							<Button
								asChild
								size={{ base: 'sm', md: 'md' }}
								borderRadius="full"
								bg="bg.card"
								color="text.primary"
								_hover={{ bg: 'bg.subtle' }}
								_dark={{ bg: 'bg.inverse', color: 'text.inverse', _hover: { bg: 'bg.inverseHover' } }}
								justifySelf="end"
							>
								<Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
									{ctaLabel}
								</Link>
							</Button>
						</Grid>
					</Box>
				</Reveal>
			</Container>
		</Box>
	);
};

export default WhatsAppBanner;

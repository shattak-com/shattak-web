'use client';

import { Box, Image as ChakraImage, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';

import type { AuthenticatedUser } from '~/lib/api/auth';

type UserAvatarProps = {
	user: Pick<AuthenticatedUser, 'avatarUrl' | 'email' | 'name'>;
	label: string;
	size?: string;
};

const getInitials = (value: string) =>
	value
		.split(/\s+/)
		.map(part => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

const UserAvatar = ({ user, label, size = '32px' }: UserAvatarProps) => {
	const avatarUrl = user.avatarUrl.trim();
	const [hasImageError, setHasImageError] = useState(false);
	const initials = useMemo(() => getInitials(label || user.email || 'User'), [label, user.email]);
	const shouldShowImage = Boolean(avatarUrl) && !hasImageError;

	useEffect(() => {
		setHasImageError(false);
	}, [avatarUrl]);

	return (
		<Box
			boxSize={size}
			borderRadius="full"
			overflow="hidden"
			bg="bg.card"
			color="text.primary"
			display="grid"
			placeItems="center"
			border="2px solid"
			borderColor="bg.card"
			flexShrink={0}
		>
			{shouldShowImage ? (
				<ChakraImage
					src={avatarUrl}
					alt={user.name || user.email}
					boxSize="100%"
					objectFit="cover"
					referrerPolicy="no-referrer"
					onError={() => setHasImageError(true)}
				/>
			) : (
				<Text fontSize={size === '32px' ? 'xs' : 'lg'} fontWeight="bold">
					{initials}
				</Text>
			)}
		</Box>
	);
};

export default UserAvatar;

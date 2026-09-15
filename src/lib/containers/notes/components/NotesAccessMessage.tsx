'use client';

import { Button, Flex, Icon, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiAlertCircle, FiLogIn, FiX } from 'react-icons/fi';

type NotesAccessMessageProps = {
	message: string;
	loginHref?: string;
	onDismiss?: () => void;
	variant?: 'login' | 'error';
};

const NotesAccessMessage = ({ message, loginHref, onDismiss, variant = 'login' }: NotesAccessMessageProps) => (
	<Flex
		role="alert"
		bg={variant === 'login' ? 'bg.brand' : 'red.50'}
		border="1px solid"
		borderColor={variant === 'login' ? 'border.brandSoft' : 'red.200'}
		borderRadius="tile"
		p={4}
		gap={3}
		direction={{ base: 'column', sm: 'row' }}
		align={{ base: 'stretch', sm: 'center' }}
		_dark={variant === 'error' ? { bg: 'red.950', borderColor: 'red.800' } : undefined}
	>
		<Icon
			as={FiAlertCircle}
			color={variant === 'login' ? 'text.brand' : 'red.500'}
			boxSize={5}
			flexShrink={0}
			display={{ base: 'none', sm: 'block' }}
		/>
		<Stack gap={0} flex={1}>
			<Text fontWeight="semibold" fontSize="sm">
				{variant === 'login' ? 'Login required' : 'Unable to open this resource'}
			</Text>
			<Text color="text.secondary" fontSize="sm">
				{message}
			</Text>
		</Stack>
		{loginHref && variant === 'login' ? (
			<Button asChild size="sm" bg="primary" color="text.inverse" borderRadius="full" flexShrink={0}>
				<Link href={loginHref}>
					<FiLogIn /> Log in
				</Link>
			</Button>
		) : null}
		{onDismiss ? (
			<Button variant="ghost" size="xs" onClick={onDismiss} aria-label="Dismiss message">
				<FiX />
			</Button>
		) : null}
	</Flex>
);

export default NotesAccessMessage;

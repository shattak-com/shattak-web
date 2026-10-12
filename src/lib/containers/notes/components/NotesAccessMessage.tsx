'use client';

import { Button, Flex, Icon, Stack, Text } from '@chakra-ui/react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

type NotesAccessMessageProps = {
	message: string;
	onDismiss?: () => void;
};

const NotesAccessMessage = ({ message, onDismiss }: NotesAccessMessageProps) => (
	<Flex
		role="alert"
		bg="red.50"
		border="1px solid"
		borderColor="red.200"
		borderRadius="tile"
		p={4}
		gap={3}
		direction={{ base: 'column', sm: 'row' }}
		align={{ base: 'stretch', sm: 'center' }}
		_dark={{ bg: 'red.950', borderColor: 'red.800' }}
	>
		<Icon as={FiAlertCircle} color="red.500" boxSize={5} flexShrink={0} display={{ base: 'none', sm: 'block' }} />
		<Stack gap={0} flex={1}>
			<Text fontWeight="semibold" fontSize="sm">
				Unable to open this resource
			</Text>
			<Text color="text.secondary" fontSize="sm">
				{message}
			</Text>
		</Stack>
		{onDismiss ? (
			<Button variant="ghost" size="xs" onClick={onDismiss} aria-label="Dismiss message">
				<FiX />
			</Button>
		) : null}
	</Flex>
);

export default NotesAccessMessage;

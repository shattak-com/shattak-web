'use client';

import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

type CopyStatus = 'idle' | 'copied' | 'error';

const getCopyButtonLabel = (status: CopyStatus) => {
	if (status === 'copied') {
		return 'Copied';
	}

	return status === 'error' ? 'Copy failed' : 'Copy';
};

const copyText = async (value: string) => {
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(value);
			return;
		} catch {
			// Fall back for browsers that expose Clipboard API but deny it in the current context.
		}
	}

	const textArea = document.createElement('textarea');
	textArea.value = value;
	textArea.setAttribute('readonly', '');
	textArea.style.position = 'fixed';
	textArea.style.opacity = '0';
	document.body.appendChild(textArea);
	textArea.select();

	let didCopy = false;

	try {
		didCopy = document.execCommand('copy');
	} finally {
		textArea.remove();
	}

	if (!didCopy) {
		throw new Error('Copy command was not accepted');
	}
};

export const LessonCodeBlock = ({ code }: { code: string }) => {
	const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
	const resetTimerRef = useRef<number | null>(null);

	useEffect(
		() => () => {
			if (resetTimerRef.current !== null) {
				window.clearTimeout(resetTimerRef.current);
			}
		},
		[]
	);

	const handleCopy = async () => {
		try {
			await copyText(code);
			setCopyStatus('copied');
		} catch {
			setCopyStatus('error');
		}

		if (resetTimerRef.current !== null) {
			window.clearTimeout(resetTimerRef.current);
		}

		resetTimerRef.current = window.setTimeout(() => setCopyStatus('idle'), 2000);
	};

	const buttonLabel = getCopyButtonLabel(copyStatus);

	return (
		<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.subtle" overflow="hidden">
			<HStack justify="flex-end" borderBottom="1px solid" borderColor="border.default" px={2} py={1.5}>
				<Button
					type="button"
					size="xs"
					minH="36px"
					borderRadius="full"
					variant="ghost"
					aria-label={buttonLabel === 'Copy' ? 'Copy code' : buttonLabel}
					onClick={() => {
						handleCopy().catch(() => undefined);
					}}
				>
					{copyStatus === 'copied' ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
					<Text as="span" aria-live="polite">
						{buttonLabel}
					</Text>
				</Button>
			</HStack>

			<Box
				as="pre"
				m={0}
				color="text.primary"
				fontSize="sm"
				overflowX="auto"
				overscrollBehaviorX="contain"
				p={{ base: 3, md: 4 }}
				WebkitOverflowScrolling="touch"
			>
				<Box as="code" display="block" bg="transparent" borderRadius={0} p={0} whiteSpace="pre">
					{code}
				</Box>
			</Box>
		</Box>
	);
};

'use client';

import { Box, Image, Stack, Text } from '@chakra-ui/react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

type QrCodePreviewProps = {
	value: string;
	label?: string;
	size?: number;
};

const QrCodePreview = ({ value, label = 'Generated QR code', size = 168 }: QrCodePreviewProps) => {
	const [dataUrl, setDataUrl] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const normalizedValue = value.trim();

	useEffect(() => {
		let isMounted = true;

		if (!normalizedValue) {
			setDataUrl('');
			setErrorMessage('');
			return () => {
				isMounted = false;
			};
		}

		QRCode.toDataURL(normalizedValue, {
			errorCorrectionLevel: 'M',
			margin: 1,
			width: size,
			color: {
				dark: '#111111',
				light: '#ffffff'
			}
		})
			.then(url => {
				if (isMounted) {
					setDataUrl(url);
					setErrorMessage('');
				}
			})
			.catch(() => {
				if (isMounted) {
					setDataUrl('');
					setErrorMessage('Unable to generate QR preview.');
				}
			});

		return () => {
			isMounted = false;
		};
	}, [normalizedValue, size]);

	if (!normalizedValue) {
		return (
			<Box
				border="1px dashed"
				borderColor="border.default"
				borderRadius="lg"
				bg="bg.subtle"
				minH={`${size}px`}
				display="grid"
				placeItems="center"
				px={4}
				textAlign="center"
			>
				<Text fontSize="sm" color="text.muted">
					Add a WhatsApp invitation link to preview its QR code.
				</Text>
			</Box>
		);
	}

	return (
		<Stack
			gap={3}
			border="1px solid"
			borderColor="border.default"
			borderRadius="lg"
			bg="bg.card"
			p={4}
			align="center"
			textAlign="center"
		>
			<Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase">
				{label}
			</Text>
			{dataUrl ? <Image src={dataUrl} alt={label} boxSize={`${size}px`} objectFit="contain" /> : null}
			{errorMessage ? (
				<Text fontSize="xs" color="red.500">
					{errorMessage}
				</Text>
			) : null}
		</Stack>
	);
};

export default QrCodePreview;

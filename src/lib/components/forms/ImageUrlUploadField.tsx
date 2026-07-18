'use client';

import { Box, Button, HStack, Image as ChakraImage, Input, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import { uploadAdminImage } from '~/lib/api/admin-uploads';

type ImageUrlUploadFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	placeholder?: string;
};

const maxImageSizeBytes = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const formatBytes = (bytes: number) => {
	const megabytes = bytes / (1024 * 1024);

	return `${megabytes.toFixed(megabytes >= 1 ? 1 : 2)}MB`;
};

const ImageUrlUploadField = ({
	label,
	value,
	onChange,
	error,
	placeholder = 'Paste image URL or upload an image'
}: ImageUrlUploadFieldProps) => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadMessage, setUploadMessage] = useState('');
	const [previewFailed, setPreviewFailed] = useState(false);
	const imageUrl = value.trim();

	useEffect(() => {
		setPreviewFailed(false);
	}, [imageUrl]);

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const input = event.currentTarget;
		const file = input.files?.[0];
		input.value = '';

		if (!file) {
			return;
		}

		if (!allowedMimeTypes.has(file.type)) {
			setUploadMessage('Only JPG, PNG, WEBP, and GIF images are allowed.');
			return;
		}

		if (file.size > maxImageSizeBytes) {
			setUploadMessage(`Image must be ${formatBytes(maxImageSizeBytes)} or smaller.`);
			return;
		}

		setIsUploading(true);
		setUploadMessage('Uploading image...');

		try {
			const result = await uploadAdminImage(file);
			onChange(result.upload.url);
			setUploadMessage('Image uploaded successfully.');
		} catch (uploadError) {
			setUploadMessage(uploadError instanceof Error ? uploadError.message : 'Unable to upload image.');
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<Box>
			<Text fontSize="xs" color="text.muted" mb={1}>
				{label}
			</Text>
			<Stack gap={3}>
				<HStack gap={2} align="start">
					<Input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} h="40px" />
					<Button
						type="button"
						variant="outline"
						borderRadius="full"
						h="40px"
						loading={isUploading}
						onClick={() => fileInputRef.current?.click()}
					>
						Upload
					</Button>
				</HStack>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/png,image/jpeg,image/webp,image/gif"
					hidden
					onChange={handleFileChange}
				/>
				{imageUrl ? (
					<Box
						border="1px solid"
						borderColor="border.default"
						borderRadius="lg"
						bg="bg.subtle"
						overflow="hidden"
						w="160px"
						aspectRatio="16 / 10"
						display="grid"
						placeItems="center"
					>
						{previewFailed ? (
							<Text px={3} textAlign="center" fontSize="xs" color="text.muted">
								Preview unavailable
							</Text>
						) : (
							<ChakraImage
								src={imageUrl}
								alt={`${label} preview`}
								w="100%"
								h="100%"
								objectFit="cover"
								referrerPolicy="no-referrer"
								onError={() => setPreviewFailed(true)}
							/>
						)}
					</Box>
				) : null}
			</Stack>
			{uploadMessage ? (
				<Text mt={1} fontSize="xs" color={uploadMessage.includes('successfully') ? 'text.muted' : 'red.500'}>
					{uploadMessage}
				</Text>
			) : null}
			{error ? (
				<Text mt={1} fontSize="xs" color="red.500">
					{error}
				</Text>
			) : null}
		</Box>
	);
};

export default ImageUrlUploadField;

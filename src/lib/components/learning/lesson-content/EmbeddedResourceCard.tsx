import { Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { FiExternalLink, FiLink } from 'react-icons/fi';

import { getEmbeddableResource } from './lesson-content-urls';

export const EmbeddedResourceCard = ({
	url,
	title,
	borderColor = 'border.default'
}: {
	url: string;
	title?: string;
	borderColor?: string;
}) => {
	const resource = getEmbeddableResource(url);
	const displayTitle = title?.trim() || 'Linked resource';

	if (!resource) {
		return (
			<Box border="1px solid" borderColor="red.300" borderRadius="card" bg="bg.card" p={{ base: 4, md: 5 }}>
				<Heading size="sm" color="red.500">
					Invalid or incomplete link
				</Heading>
				<Text mt={1} fontSize="sm" color="text.muted">
					Enter a valid HTTP(S) URL or paste iframe embed code.
				</Text>
			</Box>
		);
	}

	return (
		<Box border="1px solid" borderColor={borderColor} borderRadius="card" bg="bg.card" overflow="hidden">
			<Stack gap={{ base: 3, md: 4 }} p={{ base: 4, md: 5 }}>
				<HStack justify="space-between" gap={3} align="center" flexWrap="wrap">
					<HStack gap={3} minW={0}>
						<Box
							boxSize="42px"
							borderRadius="lg"
							bg="bg.subtle"
							color="primary"
							display="grid"
							flexShrink={0}
							fontSize="xl"
							placeItems="center"
							aria-hidden="true"
						>
							<FiLink />
						</Box>
						<Box minW={0}>
							<Heading size="sm" lineClamp={2}>
								{displayTitle}
							</Heading>
							<Text fontSize="xs" color="text.muted">
								{resource.providerLabel}
							</Text>
						</Box>
					</HStack>
					<a
						href={resource.sourceUrl}
						target="_blank"
						rel="noopener noreferrer"
						style={{
							alignItems: 'center',
							color: 'var(--chakra-colors-primary)',
							display: 'inline-flex',
							fontSize: '13px',
							fontWeight: 600,
							gap: '6px'
						}}
					>
						Open externally <FiExternalLink aria-hidden="true" />
					</a>
				</HStack>

				<Box
					aspectRatio="16 / 9"
					minH={{ base: '260px', md: '420px' }}
					border="1px solid"
					borderColor="border.default"
					borderRadius="lg"
					bg="bg.subtle"
					overflow="hidden"
				>
					<iframe
						src={resource.embedUrl}
						title={displayTitle}
						loading="lazy"
						referrerPolicy="strict-origin-when-cross-origin"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						sandbox={
							resource.isKnownProvider
								? 'allow-downloads allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts'
								: 'allow-downloads allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-scripts'
						}
						style={{ border: 0, display: 'block', height: '100%', width: '100%' }}
					/>
				</Box>
				{!resource.isKnownProvider ? (
					<Text fontSize="xs" color="text.muted">
						This URL is being loaded directly in a restricted iframe. The source website may still block embedding.
					</Text>
				) : null}
			</Stack>
		</Box>
	);
};

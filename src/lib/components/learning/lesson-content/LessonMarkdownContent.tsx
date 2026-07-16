'use client';

import { Box, Heading, Text } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { getSafeExternalUrl, getSafeIframeUrl } from '~/lib/components/learning/lesson-content/lesson-content-urls';
import { lessonMarkdownSanitizeSchema } from '~/lib/components/learning/lesson-content/lesson-markdown-sanitize';
import { MermaidDiagram } from '~/lib/components/learning/lesson-content/MermaidDiagram';

type LessonMarkdownContentProps = {
	value: string;
};

const getMermaidChart = (node: unknown) => {
	if (!node || typeof node !== 'object' || !('children' in node) || !Array.isArray(node.children)) {
		return '';
	}

	const [codeNode] = node.children;

	if (!codeNode || typeof codeNode !== 'object' || !('type' in codeNode) || codeNode.type !== 'element') {
		return '';
	}

	if (!('tagName' in codeNode) || codeNode.tagName !== 'code' || !('properties' in codeNode)) {
		return '';
	}

	const properties = codeNode.properties;
	const classNames =
		properties && typeof properties === 'object' && 'className' in properties && Array.isArray(properties.className)
			? properties.className
			: [];

	if (!classNames.includes('language-mermaid')) {
		return '';
	}

	if (!('children' in codeNode) || !Array.isArray(codeNode.children)) {
		return '';
	}

	return codeNode.children
		.filter(child => child && typeof child === 'object' && 'type' in child && child.type === 'text')
		.map(child => ('value' in child && typeof child.value === 'string' ? child.value : ''))
		.join('');
};

export const LessonMarkdownContent = ({ value }: LessonMarkdownContentProps) => {
	if (!value.trim()) {
		return (
			<Text color="text.muted" fontSize="sm">
				No text content added yet.
			</Text>
		);
	}

	return (
		<Box
			color="text.secondary"
			lineHeight="tall"
			overflowWrap="anywhere"
			css={{
				'& > * + *': { marginTop: '1rem' },
				'& audio, & video': { maxWidth: '100%', width: '100%' },
				'& button, & input, & select, & textarea': {
					background: 'var(--chakra-colors-bg-card)',
					border: '1px solid var(--chakra-colors-border-default)',
					borderRadius: 'var(--chakra-radii-md)',
					color: 'var(--chakra-colors-text-primary)',
					font: 'inherit',
					padding: '0.625rem 0.75rem'
				},
				'& button': { cursor: 'pointer' },
				'& input[type="checkbox"], & input[type="range"]': { padding: 0 },
				'& svg': { height: 'auto', maxWidth: '100%' }
			}}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[
					rehypeRaw,
					[rehypeSanitize, lessonMarkdownSanitizeSchema],
					[rehypeKatex, { throwOnError: false, strict: 'warn' }]
				]}
				components={{
					h1: ({ children }) => (
						<Heading as="h1" size="xl" color="text.primary" mt={2}>
							{children}
						</Heading>
					),
					h2: ({ children }) => (
						<Heading as="h2" size="lg" color="text.primary" mt={2}>
							{children}
						</Heading>
					),
					h3: ({ children }) => (
						<Heading as="h3" size="md" color="text.primary">
							{children}
						</Heading>
					),
					h4: ({ children }) => (
						<Heading as="h4" size="sm" color="text.primary">
							{children}
						</Heading>
					),
					p: ({ children }) => (
						<Text color="text.secondary" fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall">
							{children}
						</Text>
					),
					a: ({ href, children }) => {
						const safeHref = getSafeExternalUrl(href ?? '');

						return safeHref ? (
							<a
								href={safeHref}
								target="_blank"
								rel="noopener noreferrer"
								style={{ color: 'var(--chakra-colors-primary)', fontWeight: 600 }}
							>
								{children}
							</a>
						) : (
							<Box as="span">{children}</Box>
						);
					},
					img: ({ src, alt, title, width, height }) => {
						const safeSrc = getSafeExternalUrl(typeof src === 'string' ? src : '');

						return safeSrc ? (
							// Markdown authors can use arbitrary remote image hosts that Next Image cannot preconfigure safely.
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={safeSrc}
								alt={alt ?? ''}
								title={title}
								width={width}
								height={height}
								loading="lazy"
								style={{
									border: '1px solid var(--chakra-colors-border-default)',
									borderRadius: 'var(--chakra-radii-lg)',
									display: 'block',
									height: 'auto',
									margin: '1rem 0',
									maxWidth: '100%',
									objectFit: 'contain'
								}}
							/>
						) : null;
					},
					iframe: ({ src, title, width, height }) => {
						const safeSrc = getSafeIframeUrl(typeof src === 'string' ? src : '');

						return safeSrc ? (
							<Box aspectRatio="16 / 9" borderRadius="lg" overflow="hidden" bg="black" my={4}>
								<iframe
									src={safeSrc}
									title={title || 'Embedded lesson media'}
									width={width}
									height={height}
									loading="lazy"
									referrerPolicy="strict-origin-when-cross-origin"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
									sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
									style={{ border: 0, height: '100%', width: '100%' }}
								/>
							</Box>
						) : (
							<Text color="text.muted" fontSize="sm">
								This embedded media source is not supported.
							</Text>
						);
					},
					audio: ({ src, title, children }) => {
						const safeSrc = getSafeExternalUrl(typeof src === 'string' ? src : '');

						return safeSrc || children ? (
							// Caption/transcript metadata is not part of the current inline HTML content model.
							// eslint-disable-next-line jsx-a11y/media-has-caption
							<audio controls src={safeSrc || undefined} title={title} preload="metadata">
								{children}
							</audio>
						) : null;
					},
					video: ({ src, poster, title, children }) => {
						const safeSrc = getSafeExternalUrl(typeof src === 'string' ? src : '');
						const safePoster = getSafeExternalUrl(typeof poster === 'string' ? poster : '');

						return safeSrc || children ? (
							// Caption tracks are not part of the current inline HTML content model.
							// eslint-disable-next-line jsx-a11y/media-has-caption
							<video
								controls
								src={safeSrc || undefined}
								poster={safePoster || undefined}
								title={title}
								preload="metadata"
								playsInline
								style={{
									background: '#000',
									borderRadius: 'var(--chakra-radii-lg)',
									margin: '1rem 0',
									maxHeight: '70vh',
									width: '100%'
								}}
							>
								{children}
							</video>
						) : null;
					},
					source: ({ src, type, media }) => {
						const safeSrc = getSafeExternalUrl(typeof src === 'string' ? src : '');

						return safeSrc ? <source src={safeSrc} type={type} media={media} /> : null;
					},
					object: ({ data, type, width, height, children }) => {
						const safeData = getSafeExternalUrl(typeof data === 'string' ? data : '');

						return safeData && type === 'application/pdf' ? (
							<object
								data={safeData}
								type="application/pdf"
								width={width}
								height={height}
								style={{ border: '1px solid var(--chakra-colors-border-default)', minHeight: '560px', width: '100%' }}
							>
								{children || 'This browser cannot preview the PDF.'}
							</object>
						) : null;
					},
					embed: ({ src, type, width, height }) => {
						const safeSrc = getSafeExternalUrl(typeof src === 'string' ? src : '');

						return safeSrc && type === 'application/pdf' ? (
							<embed
								src={safeSrc}
								type="application/pdf"
								width={width}
								height={height}
								style={{ border: '1px solid var(--chakra-colors-border-default)', minHeight: '560px', width: '100%' }}
							/>
						) : null;
					},
					input: ({
						type,
						value: initialValue,
						checked,
						disabled,
						max,
						maxLength,
						min,
						placeholder,
						readOnly,
						step
					}) => (
						<input
							type={type}
							defaultValue={
								type === 'checkbox' || (typeof initialValue !== 'string' && typeof initialValue !== 'number')
									? undefined
									: initialValue
							}
							defaultChecked={checked}
							disabled={disabled}
							max={max}
							maxLength={maxLength}
							min={min}
							placeholder={placeholder}
							readOnly={readOnly}
							step={step}
						/>
					),
					button: ({ children, disabled, value }) => (
						<button disabled={disabled} value={value} type="button">
							{children}
						</button>
					),
					blockquote: ({ children }) => (
						<Box borderLeft="4px solid" borderColor="primary" bg="bg.subtle" borderRadius="md" px={4} py={3}>
							{children}
						</Box>
					),
					ul: ({ children }) => (
						<Box as="ul" ps={6}>
							{children}
						</Box>
					),
					ol: ({ children }) => (
						<Box as="ol" ps={6}>
							{children}
						</Box>
					),
					li: ({ children }) => (
						<Box as="li" mb={1.5}>
							{children}
						</Box>
					),
					code: ({ children }) => (
						<Box as="code" bg="bg.subtle" borderRadius="sm" px={1.5} py={0.5}>
							{children}
						</Box>
					),
					pre: ({ node, children }) => {
						const mermaidChart = getMermaidChart(node);

						return mermaidChart ? (
							<MermaidDiagram chart={mermaidChart} />
						) : (
							<Box
								as="pre"
								bg="bg.subtle"
								border="1px solid"
								borderColor="border.default"
								borderRadius="lg"
								color="text.primary"
								fontSize="sm"
								overflowX="auto"
								p={4}
							>
								{children}
							</Box>
						);
					},
					hr: () => <Box borderTop="1px solid" borderColor="border.default" />,
					table: ({ children }) => (
						<Box overflowX="auto" border="1px solid" borderColor="border.default" borderRadius="lg">
							<Box as="table" w="full" minW="520px" borderCollapse="collapse">
								{children}
							</Box>
						</Box>
					),
					thead: ({ children }) => (
						<Box as="thead" bg="bg.subtle">
							{children}
						</Box>
					),
					th: ({ children }) => (
						<Box as="th" borderBottom="1px solid" borderColor="border.default" fontSize="sm" p={3} textAlign="left">
							{children}
						</Box>
					),
					td: ({ children }) => (
						<Box as="td" borderTop="1px solid" borderColor="border.default" fontSize="sm" p={3}>
							{children}
						</Box>
					)
				}}
			>
				{value}
			</ReactMarkdown>
		</Box>
	);
};

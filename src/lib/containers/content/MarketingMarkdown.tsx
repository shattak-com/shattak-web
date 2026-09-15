'use client';

import { Box, Heading, Link as ChakraLink, Separator, Text } from '@chakra-ui/react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarketingMarkdownProps = {
	markdown: string;
};

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

const MarketingMarkdown = ({ markdown }: MarketingMarkdownProps) => (
	<Box
		color="text.secondary"
		fontSize={{ base: 'sm', md: 'md' }}
		lineHeight="relaxed"
		overflowWrap="anywhere"
		css={{
			'& > * + *': { marginTop: '1.25rem' },
			'& ul, & ol': { paddingInlineStart: '1.5rem' },
			'& li + li': { marginTop: '0.5rem' },
			'& table': {
				borderCollapse: 'collapse',
				display: 'block',
				maxWidth: '100%',
				overflowX: 'auto',
				width: '100%'
			},
			'& th, & td': {
				border: '1px solid var(--chakra-colors-border-default)',
				minWidth: '8rem',
				padding: '0.75rem 1rem',
				textAlign: 'left',
				verticalAlign: 'top'
			},
			'& th': {
				background: 'var(--chakra-colors-bg-subtle)',
				color: 'var(--chakra-colors-text-primary)',
				fontWeight: '600'
			},
			'& code': {
				background: 'var(--chakra-colors-bg-subtle)',
				borderRadius: '0.375rem',
				fontSize: '0.9em',
				padding: '0.125rem 0.375rem'
			}
		}}
	>
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				h1: ({ children }) => (
					<Heading
						as="h1"
						fontSize={{ base: '3xl', md: '5xl' }}
						lineHeight="display"
						letterSpacing="tight"
						color="text.primary"
					>
						{children}
					</Heading>
				),
				h2: ({ children }) => (
					<Heading
						as="h2"
						fontSize={{ base: 'xl', md: '2xl' }}
						lineHeight="title"
						color="text.primary"
						mt={{ base: 10, md: 12 }}
					>
						{children}
					</Heading>
				),
				h3: ({ children }) => (
					<Heading
						as="h3"
						fontSize={{ base: 'lg', md: 'xl' }}
						lineHeight="title"
						color="text.primary"
						mt={{ base: 7, md: 8 }}
					>
						{children}
					</Heading>
				),
				p: ({ children }) => (
					<Text color="text.secondary" fontSize={{ base: 'sm', md: 'md' }} lineHeight="relaxed">
						{children}
					</Text>
				),
				a: ({ href = '', children }) => {
					const external = isExternalHref(href);

					return (
						<ChakraLink
							asChild
							color="text.brand"
							fontWeight="semibold"
							textDecoration="underline"
							textUnderlineOffset="3px"
						>
							<Link
								href={href}
								target={external ? '_blank' : undefined}
								rel={external ? 'noopener noreferrer' : undefined}
							>
								{children}
							</Link>
						</ChakraLink>
					);
				},
				blockquote: ({ children }) => (
					<Box
						as="blockquote"
						borderLeft="4px solid"
						borderColor="border.brand"
						bg="bg.brand"
						borderRadius="soft"
						px={5}
						py={4}
					>
						{children}
					</Box>
				),
				hr: () => <Separator my={{ base: 8, md: 10 }} borderColor="border.muted" />
			}}
		>
			{markdown}
		</ReactMarkdown>
	</Box>
);

export default MarketingMarkdown;

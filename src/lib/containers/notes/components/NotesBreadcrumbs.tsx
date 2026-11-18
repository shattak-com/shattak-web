'use client';

import { HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';

type Crumb = { label: string; href?: string };

// Ancestors are visible on every Notes page. Warm them only on explicit intent.
const BreadcrumbLink = ({ href, label }: { href: string; label: string }) => {
	const [intent, setIntent] = useState(false);
	return (
		<Link
			href={href}
			prefetch={intent ? null : false}
			onPointerEnter={event => {
				if (event.pointerType === 'mouse') setIntent(true);
			}}
			onPointerLeave={() => setIntent(false)}
			onFocus={() => setIntent(true)}
			onBlur={() => setIntent(false)}
		>
			<Text _hover={{ color: 'text.brand' }}>{label}</Text>
		</Link>
	);
};

const NotesBreadcrumbs = ({ items }: { items: Crumb[] }) => (
	<HStack as="nav" aria-label="Breadcrumb" gap={1.5} flexWrap="wrap" color="text.muted" fontSize="sm">
		{items.map((item, index) => (
			<HStack key={item.href ?? item.label} gap={1.5}>
				{index ? <FiChevronRight aria-hidden="true" /> : null}
				{item.href ? (
					<BreadcrumbLink href={item.href} label={item.label} />
				) : (
					<Text color="text.primary" fontWeight="medium" aria-current="page">
						{item.label}
					</Text>
				)}
			</HStack>
		))}
	</HStack>
);

export default NotesBreadcrumbs;

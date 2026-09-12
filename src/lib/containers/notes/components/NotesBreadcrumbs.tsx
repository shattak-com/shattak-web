import { HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

type Crumb = { label: string; href?: string };

const NotesBreadcrumbs = ({ items }: { items: Crumb[] }) => (
	<HStack as="nav" aria-label="Breadcrumb" gap={1.5} flexWrap="wrap" color="text.muted" fontSize="sm">
		{items.map((item, index) => (
			<HStack key={item.href ?? item.label} gap={1.5}>
				{index ? <FiChevronRight aria-hidden="true" /> : null}
				{item.href ? (
					<Link href={item.href}>
						<Text _hover={{ color: 'text.brand' }}>{item.label}</Text>
					</Link>
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

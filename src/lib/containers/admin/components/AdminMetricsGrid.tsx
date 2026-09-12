import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export type AdminMetricItem = {
	label: string;
	value: number | string;
	helperText?: string;
	icon: ReactNode;
};

const AdminMetricsGrid = ({ items, isLoading = false }: { items: AdminMetricItem[]; isLoading?: boolean }) => (
	<SimpleGrid columns={{ base: 1, sm: 2, xl: 3, '2xl': items.length }} gap={3}>
		{items.map(item => (
			<Box
				key={item.label}
				border="1px solid"
				borderColor="border.default"
				borderRadius="lg"
				bg="bg.card"
				p={4}
				minW={0}
				minH="108px"
			>
				<Stack gap={2}>
					<Box color="icon.brand" fontSize="xl" aria-hidden="true">
						{item.icon}
					</Box>
					<Box minW={0}>
						<Text fontSize="xl" fontWeight="bold" lineHeight="shorter">
							{isLoading ? '—' : item.value}
						</Text>
						<Text mt={1} fontSize="xs" color="text.secondary" fontWeight="semibold">
							{item.label}
						</Text>
						{item.helperText ? (
							<Text mt={1} fontSize="2xs" color="text.muted">
								{item.helperText}
							</Text>
						) : null}
					</Box>
				</Stack>
			</Box>
		))}
	</SimpleGrid>
);

export default AdminMetricsGrid;

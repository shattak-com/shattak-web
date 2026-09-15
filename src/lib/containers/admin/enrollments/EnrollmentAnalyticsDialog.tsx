'use client';

import { Box, Button, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { FiCalendar, FiClock, FiTrendingUp, FiX } from 'react-icons/fi';

import type { AdminEnrollmentStats } from '~/lib/api/admin-enrollments';
import { formatMonthKey } from '~/lib/containers/admin/utils/monthly-metrics';

type EnrollmentAnalyticsDialogProps = {
	isLoading: boolean;
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	stats: AdminEnrollmentStats | null;
};

const AnalyticsMetric = ({
	icon,
	label,
	value,
	helperText,
	isLoading
}: {
	icon: ReactNode;
	label: string;
	value: number;
	helperText: string;
	isLoading: boolean;
}) => (
	<Box border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.subtle" p={4} minW={0}>
		<Stack gap={2}>
			<Box color="icon.brand" fontSize="xl" aria-hidden="true">
				{icon}
			</Box>
			<Text fontSize="2xl" fontWeight="bold" lineHeight="shorter">
				{isLoading ? '—' : value}
			</Text>
			<Box>
				<Text fontSize="sm" fontWeight="semibold">
					{label}
				</Text>
				<Text mt={1} fontSize="xs" color="text.muted">
					{helperText}
				</Text>
			</Box>
		</Stack>
	</Box>
);

const EnrollmentAnalyticsDialog = ({ isLoading, isOpen, onOpenChange, stats }: EnrollmentAnalyticsDialogProps) => {
	const dialogRef = useRef<HTMLDialogElement | null>(null);
	const currentMonthLabel = stats ? formatMonthKey(stats.currentMonthKey) : 'Current month';
	const previousMonthLabel = stats ? formatMonthKey(stats.previousMonthKey) : 'Previous month';
	const baselineLabel = stats ? formatMonthKey(stats.baselineMonthKey) : 'July 2026';

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen && !dialog.open) {
			dialog.showModal();
		} else if (!isOpen && dialog.open) {
			dialog.close();
		}
	}, [isOpen]);

	return (
		<Box
			asChild
			position="fixed"
			inset={0}
			m="auto"
			maxH="none"
			maxW="none"
			h="100dvh"
			w="full"
			border={0}
			bg="transparent"
			color="text.primary"
			p={0}
			css={{
				'&::backdrop': { background: 'rgba(17, 24, 39, 0.64)' },
				'&[open]': { display: 'grid', placeItems: 'center' }
			}}
		>
			<dialog
				ref={dialogRef}
				aria-labelledby="enrollment-analytics-title"
				aria-describedby="enrollment-analytics-description"
				onCancel={event => {
					event.preventDefault();
					onOpenChange(false);
				}}
			>
				<Box asChild position="absolute" inset={0} border={0} bg="transparent" p={0}>
					<button
						type="button"
						tabIndex={-1}
						aria-label="Close enrollment analytics"
						onClick={() => onOpenChange(false)}
					/>
				</Box>
				<Box
					position="relative"
					zIndex={1}
					w={{ base: 'calc(100% - 24px)', md: 'min(760px, calc(100% - 48px))' }}
					maxH="calc(100dvh - 32px)"
					mx="auto"
					my={4}
					bg="bg.card"
					borderRadius="panel"
					boxShadow="elevated"
					overflowY="auto"
				>
					<Box borderBottom="1px solid" borderColor="border.default" p={{ base: 4, md: 5 }} pr={14}>
						<Stack gap={1}>
							<Text id="enrollment-analytics-title" fontSize="lg" fontWeight="bold">
								Enrollment analytics
							</Text>
							<Text id="enrollment-analytics-description" fontSize="sm" color="text.muted">
								Monthly enrollment trends for the currently applied course filters.
							</Text>
						</Stack>
					</Box>
					<Stack gap={5} p={{ base: 4, md: 5 }}>
						<SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
							<AnalyticsMetric
								icon={<FiCalendar />}
								label="New enrollments"
								value={stats?.currentMonthEnrollmentCount ?? 0}
								helperText={currentMonthLabel}
								isLoading={isLoading}
							/>
							<AnalyticsMetric
								icon={<FiClock />}
								label="Previous month"
								value={stats?.previousMonthEnrollmentCount ?? 0}
								helperText={previousMonthLabel}
								isLoading={isLoading}
							/>
							<AnalyticsMetric
								icon={<FiTrendingUp />}
								label="Average / month"
								value={stats?.averageEnrollmentsPerMonth ?? 0}
								helperText={`Since ${baselineLabel}`}
								isLoading={isLoading}
							/>
						</SimpleGrid>

						<Box border="1px solid" borderColor="border.default" borderRadius="lg" p={4}>
							<Stack gap={3}>
								<Text fontSize="sm" fontWeight="semibold">
									How these figures are calculated
								</Text>
								<Stack gap={2} fontSize="xs" color="text.muted">
									<Text>Monthly counts use {stats?.timeZone ?? 'Asia/Kolkata'} calendar boundaries.</Text>
									<Text>
										The average is total filtered enrollments divided by the number of calendar months since{' '}
										{baselineLabel}.
									</Text>
									<Text>All values update when the course filters change.</Text>
								</Stack>
							</Stack>
						</Box>
						<Button alignSelf="flex-end" variant="outline" borderRadius="full" onClick={() => onOpenChange(false)}>
							Close
						</Button>
					</Stack>
					<Button
						position="absolute"
						top={3}
						right={3}
						variant="ghost"
						size="sm"
						aria-label="Close enrollment analytics"
						onClick={() => onOpenChange(false)}
					>
						<FiX aria-hidden="true" />
					</Button>
				</Box>
			</dialog>
		</Box>
	);
};

export default EnrollmentAnalyticsDialog;

'use client';

import { Box, Flex, Heading, Icon, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiArrowUpRight, FiBookOpen, FiFolder } from 'react-icons/fi';

import { trackNotesEvent } from '~/lib/analytics/mixpanel';
import type { NoteDepartment } from '~/lib/api/notes';

const isImageUrl = (value: string) => /^https?:\/\//i.test(value);

const DepartmentIcon = ({ value }: { value: string }) => {
	let content = <Icon as={FiFolder} boxSize={5} />;
	if (value && isImageUrl(value)) content = <Image src={value} alt="" boxSize={6} objectFit="contain" />;
	else if (value)
		content = (
			<Text fontSize="xl" lineHeight="1">
				{value}
			</Text>
		);

	return (
		<Flex
			boxSize={11}
			borderRadius="tile"
			bg="bg.brand"
			align="center"
			justify="center"
			flexShrink={0}
			color="text.brand"
		>
			{content}
		</Flex>
	);
};

const DepartmentGrid = ({ departments }: { departments: NoteDepartment[] }) => {
	if (!departments.length) {
		return (
			<Box border="1px dashed" borderColor="border.muted" borderRadius="panel" p={8} textAlign="center">
				<Icon as={FiBookOpen} boxSize={7} color="text.muted" mb={3} />
				<Heading size="md">Departments are being prepared</Heading>
				<Text color="text.muted" fontSize="sm" mt={1}>
					Please check back soon for new notes and resources.
				</Text>
			</Box>
		);
	}

	return (
		<SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
			{departments.map(department => {
				const href = `/notes/${department.slug}`;
				return (
					<Box
						key={department.id}
						asChild
						bg="bg.card"
						border="1px solid"
						borderColor="border.default"
						borderRadius="tile"
						p={5}
						_hover={{ borderColor: 'border.brandSoft', boxShadow: 'soft', transform: 'translateY(-2px)' }}
						transition="all 0.2s ease"
					>
						<Link
							href={href}
							onClick={() =>
								trackNotesEvent({
									eventName: 'Department Opened',
									location: 'notes_departments',
									departmentId: department.id
								})
							}
						>
							<Flex gap={4} align="center">
								<DepartmentIcon value={department.icon} />
								<Stack gap={0.5} minW={0} flex={1}>
									<Text fontWeight="semibold" lineClamp={2}>
										{department.name}
									</Text>
									<Text color="text.muted" fontSize="xs">
										{department.subjectCount} {department.subjectCount === 1 ? 'subject' : 'subjects'} available
									</Text>
								</Stack>
								<Icon as={FiArrowUpRight} color="text.muted" />
							</Flex>
						</Link>
					</Box>
				);
			})}
		</SimpleGrid>
	);
};

export default DepartmentGrid;

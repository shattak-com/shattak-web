import { Box, Stack } from '@chakra-ui/react';

const CourseDashboardSkeleton = () => (
	<Stack gap={4}>
		<Box borderRadius="card" bg="bg.card" border="1px solid" borderColor="border.default" p={{ base: 5, md: 7 }}>
			<Stack gap={4}>
				<Box h="28px" w="240px" bg="bg.subtle" borderRadius="full" />
				<Box h="20px" w="60%" bg="bg.subtle" borderRadius="full" />
				<Box h="140px" w="full" bg="bg.subtle" borderRadius="card" />
			</Stack>
		</Box>
		<Box borderRadius="card" bg="bg.card" border="1px solid" borderColor="border.default" h="260px" />
	</Stack>
);

export default CourseDashboardSkeleton;

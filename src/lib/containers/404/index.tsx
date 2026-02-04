'use client';

import { Box, Button, Heading, Image, Text, Flex } from '@chakra-ui/react';
import Link from 'next/link';

export const Page404 = () => {
	return (
		<Flex minHeight="70vh" direction="column" justifyContent="center">
			<Image
				margin="0 auto"
				width={{ base: '100%', sm: '70%', md: '60%' }}
				src="/assets/not-found.svg"
				alt="Error 404 not found Illustration"
			/>
			<Box marginY={4}>
				<Heading textAlign="center" size="lg">
					Page not Found.
				</Heading>

				<Box textAlign="center" marginTop={4}>
					<Text fontSize="sm" color="text.muted">
						It&apos;s Okay!
					</Text>
					<Button asChild size="sm">
						<Link href="/">Let&apos;s Head Back</Link>
					</Button>
				</Box>
			</Box>
		</Flex>
	);
};

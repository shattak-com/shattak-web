'use client';

import { Box, Button, Container, Flex, HStack, IconButton, Text, Drawer } from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

import ThemeToggle from '~/lib/components/ThemeToggle';

const headerLinks = [
	{
		id: 'campus-ambassador',
		label: 'Campus Ambassador Program',
		href: 'https://forms.gle/HqTLJG6EcNzgNRcW9',
		external: true
	}
];

const Header = () => {
	const mobileMenuEnabled = false;
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Box
			as="header"
			position="sticky"
			top="0"
			zIndex="1000"
			bg="bg.header"
			backdropFilter="blur(12px)"
			borderBottom="1px solid"
			borderColor="border.muted"
		>
			<Container maxW="6xl" py={{ base: 3, md: 4 }}>
				<Flex align="center" justify={{ base: 'center', md: 'space-between' }} position="relative">
					<Link href="/" aria-label="Shattak home">
						<Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" letterSpacing="tight" color="text.primary">
							Shattak
						</Text>
					</Link>
					<Box
						display={{ base: 'inline-flex', md: 'none' }}
						position="absolute"
						right="0"
						top="50%"
						transform="translateY(-50%)"
					>
						<ThemeToggle />
					</Box>
					<HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
						{headerLinks.map(link => (
							<Link
								key={link.id}
								href={link.href}
								target={link.external ? '_blank' : undefined}
								rel={link.external ? 'noopener noreferrer' : undefined}
							>
								<Text fontSize="sm" fontWeight="medium" color="text.secondary">
									{link.label}
								</Text>
							</Link>
						))}
						<Button
							asChild
							bg="primary"
							color="text.inverse"
							_hover={{ bg: 'primaryHover' }}
							borderRadius="full"
							px={6}
						>
							<Link href="https://forms.gle/yQVwU7FJ9Q5rDHTq7" target="_blank" rel="noopener noreferrer">
								Become an Instructor
							</Link>
						</Button>
						<ThemeToggle />
					</HStack>

					{mobileMenuEnabled ? (
						<Drawer.Root placement="right" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
							<Drawer.Trigger asChild>
								<IconButton
									display={{ base: 'inline-flex', md: 'none' }}
									aria-label="Open menu"
									variant="outline"
									borderRadius="full"
								>
									<FiMenu />
								</IconButton>
							</Drawer.Trigger>
							<Drawer.Backdrop />
							<Drawer.Positioner>
								<Drawer.Content borderRadius="card" p={6}>
									<Flex align="center" justify="space-between" mb={6}>
										<Text fontWeight="bold" fontSize="xl">
											Shattak
										</Text>
										<Drawer.CloseTrigger asChild>
											<IconButton aria-label="Close menu" variant="ghost">
												<FiX />
											</IconButton>
										</Drawer.CloseTrigger>
									</Flex>
									<Flex direction="column" gap={4}>
										{headerLinks.map(link => (
											<Link
												key={link.id}
												href={link.href}
												onClick={() => setIsOpen(false)}
												target={link.external ? '_blank' : undefined}
												rel={link.external ? 'noopener noreferrer' : undefined}
											>
												<Text fontSize="md" fontWeight="medium">
													{link.label}
												</Text>
											</Link>
										))}
										<Button
											asChild
											bg="primary"
											color="text.inverse"
											_hover={{ bg: 'primaryHover' }}
											borderRadius="full"
											mt={2}
											onClick={() => setIsOpen(false)}
										>
											<Link href="https://forms.gle/yQVwU7FJ9Q5rDHTq7" target="_blank" rel="noopener noreferrer">
												Become an Instructor
											</Link>
										</Button>
									</Flex>
								</Drawer.Content>
							</Drawer.Positioner>
						</Drawer.Root>
					) : null}
				</Flex>
			</Container>
		</Box>
	);
};

export default Header;

'use client';

import {
	Badge,
	Box,
	Container,
	Heading,
	HStack,
	IconButton,
	Separator,
	SimpleGrid,
	Stack,
	Text
} from '@chakra-ui/react';
import Link from 'next/link';
import { FiInstagram, FiLinkedin, FiTwitter, FiYoutube } from 'react-icons/fi';

import { trackCtaClicked } from '~/lib/analytics/mixpanel';
import { courseCategories } from '~/lib/constants/landing';
import { footerPageGroups } from '~/lib/constants/marketing-pages';

const socialLinks = [
	{ label: 'Instagram', href: 'https://www.instagram.com/shattakofficial/', icon: FiInstagram },
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/company/shattak/', icon: FiLinkedin },
	{ label: 'YouTube', href: 'https://www.youtube.com/@shattakofficial', icon: FiYoutube },
	{ label: 'X', href: 'https://x.com/shattakofficial', icon: FiTwitter }
] as const;

const getCourseCategoryHref = (category: string, index: number) =>
	index === 0 ? '/#courses' : `/?category=${encodeURIComponent(category)}#courses`;

const Footer = () => (
	<Box as="footer" bg="bg.footer" color="text.onDark" py={{ base: 12, md: 16 }}>
		<Container maxW="6xl">
			<SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 10, md: 12 }}>
				<Stack gap={5} minW={0}>
					<Stack gap={2}>
						<Heading size="lg">Shattak</Heading>
						<Text fontSize="sm" color="text.onDarkMuted" lineHeight="body">
							Learn from Experts. Build What Matters.
						</Text>
					</Stack>

					<HStack gap={2}>
						{socialLinks.map(link => (
							<IconButton
								key={link.label}
								asChild
								aria-label={`Follow Shattak on ${link.label}`}
								title={link.label}
								variant="outline"
								borderColor="border.onDark"
								color="text.onDark"
								borderRadius="full"
								size="sm"
								_hover={{ bg: 'bg.glassSoft', borderColor: 'border.brand' }}
							>
								<Link href={link.href} target="_blank" rel="noopener noreferrer">
									<link.icon />
								</Link>
							</IconButton>
						))}
					</HStack>

					<Stack gap={2} align="flex-start">
						<Text fontSize="xs" color="text.onDarkSubtle" textTransform="uppercase" letterSpacing="wider">
							Mobile apps
						</Text>
						<HStack gap={2} flexWrap="wrap">
							<Badge bg="bg.glassSoft" color="text.onDarkMuted" borderRadius="full" px={3} py={1.5}>
								iOS · Coming soon
							</Badge>
							<Badge bg="bg.glassSoft" color="text.onDarkMuted" borderRadius="full" px={3} py={1.5}>
								Android · Coming soon
							</Badge>
						</HStack>
					</Stack>
				</Stack>

				{footerPageGroups.map(group => (
					<Stack as="nav" aria-labelledby={`footer-${group.id}-heading`} key={group.id} gap={3} minW={0}>
						<Text id={`footer-${group.id}-heading`} fontWeight="semibold" color="text.onDark">
							{group.label}
						</Text>
						{group.links.map(link => {
							const href = `/${link.slug}`;

							return (
								<Link
									key={link.slug}
									href={href}
									onClick={() =>
										trackCtaClicked({
											label: link.label,
											location: 'footer_quick_links',
											destination: href,
											context: group.id
										})
									}
								>
									<Text
										fontSize="sm"
										color="text.onDarkMuted"
										_hover={{ color: 'text.onDark', textDecoration: 'underline', textUnderlineOffset: '3px' }}
									>
										{link.label}
									</Text>
								</Link>
							);
						})}
					</Stack>
				))}
			</SimpleGrid>

			<Separator my={{ base: 10, md: 12 }} borderColor="border.onDark" />

			<Box as="nav" aria-labelledby="footer-courses-heading">
				<Heading id="footer-courses-heading" size="md" mb={5}>
					Courses
				</Heading>
				<SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gapX={{ base: 4, md: 8 }} gapY={3}>
					{courseCategories
						.filter(category => !category.includes('Private'))
						.map((category, index) => {
							const href = getCourseCategoryHref(category, index);

							return (
								<Link
									key={category}
									href={href}
									onClick={() =>
										trackCtaClicked({
											label: category,
											location: 'footer_quick_links',
											destination: href,
											context: 'course_category'
										})
									}
								>
									<Text
										fontSize="xs"
										color="text.onDarkMuted"
										lineHeight="body"
										_hover={{ color: 'text.onDark', textDecoration: 'underline', textUnderlineOffset: '3px' }}
									>
										{category}
									</Text>
								</Link>
							);
						})}
				</SimpleGrid>
			</Box>

			<Separator my={8} borderColor="border.onDark" />
			<Stack direction={{ base: 'column', md: 'row' }} justify="space-between" gap={3}>
				<Text fontSize="xs" color="text.onDarkSubtle">
					© {new Date().getFullYear()} Shattak. All rights reserved.
				</Text>
				<Link href="mailto:hello@shattak.com">
					<Text fontSize="xs" color="text.onDarkMuted" _hover={{ color: 'text.onDark' }}>
						hello@shattak.com
					</Text>
				</Link>
			</Stack>
		</Container>
	</Box>
);

export default Footer;

'use client';

import {
	Badge,
	Box,
	Button,
	Container,
	Heading,
	HStack,
	Input,
	SimpleGrid,
	Stack,
	Text,
	Textarea
} from '@chakra-ui/react';

import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';

const brandColors = [
	{ name: 'Brand 50', token: 'brand.50', value: '#FFF1ED' },
	{ name: 'Brand 100', token: 'brand.100', value: '#FFD7CF' },
	{ name: 'Brand 300', token: 'brand.300', value: '#FF8A7A' },
	{ name: 'Brand 500', token: 'brand.500', value: '#FF6B57' },
	{ name: 'Brand 600', token: 'brand.600', value: '#E55B49' },
	{ name: 'Accent 500', token: 'accent.500', value: '#4E78FF' }
];

const surfaceColors = [
	{ name: 'Canvas', token: 'bg.canvas', value: 'semantic' },
	{ name: 'Surface', token: 'bg.surface', value: '#F9FAFB' },
	{ name: 'Subtle', token: 'bg.subtle', value: '#FFF6F3' },
	{ name: 'Card', token: 'bg.card', value: 'semantic' },
	{ name: 'Accent', token: 'bg.accent', value: '#F3F7FF' },
	{ name: 'Brand', token: 'bg.brand', value: '#FFF1ED' }
];

const radii = [
	{ name: 'Soft', token: 'soft', value: '12px' },
	{ name: 'Tile', token: 'tile', value: '16px' },
	{ name: 'Panel', token: 'panel', value: '20px' },
	{ name: 'Card', token: 'card', value: '24px' },
	{ name: 'Surface', token: 'surface', value: '32px' },
	{ name: 'Full', token: 'full', value: 'pill' }
];

const shadows = [
	{ name: 'Soft', token: 'soft' },
	{ name: 'Card', token: 'card' },
	{ name: 'Elevated', token: 'elevated' },
	{ name: 'Primary', token: 'primary' },
	{ name: 'Brand soft', token: 'brandSoft' },
	{ name: 'Accent soft', token: 'accentSoft' }
];

type SwatchGridProps = {
	items: Array<{ name: string; token: string; value: string }>;
};

const SectionShell = ({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) => (
	<Box as="section" py={{ base: 8, md: 10 }}>
		<Stack gap={5}>
			<Stack gap={1}>
				<Text color="primary" fontSize="sm" fontWeight="bold" textTransform="uppercase">
					{eyebrow}
				</Text>
				<Heading fontSize={{ base: 'xl', md: '2xl' }} lineHeight="title">
					{title}
				</Heading>
			</Stack>
			{children}
		</Stack>
	</Box>
);

const SwatchGrid = ({ items }: SwatchGridProps) => (
	<SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
		{items.map(item => (
			<Box
				key={item.token}
				bg="bg.card"
				border="1px solid"
				borderColor="border.default"
				borderRadius="card"
				p={4}
				boxShadow="soft"
			>
				<Box h="92px" borderRadius="panel" bg={item.token} border="1px solid" borderColor="border.default" />
				<Stack gap={1} mt={3}>
					<Text fontWeight="semibold">{item.name}</Text>
					<Text fontSize="sm" color="text.muted">
						{item.token}
					</Text>
					<Text fontSize="xs" color="text.muted">
						{item.value}
					</Text>
				</Stack>
			</Box>
		))}
	</SimpleGrid>
);

const TypographyShowcase = () => (
	<SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
		<Box bg="bg.card" border="1px solid" borderColor="border.default" borderRadius="card" p={{ base: 5, md: 6 }}>
			<Stack gap={4}>
				<Text color="text.muted" fontSize="sm">
					Heading / Bricolage Grotesque
				</Text>
				<Heading fontSize={{ base: '3xl', md: '5xl' }} lineHeight="display" letterSpacing="tight">
					Build skills with guided sessions.
				</Heading>
				<Heading fontSize={{ base: 'xl', md: '2xl' }} lineHeight="title">
					Course pages use clear hierarchy and compact proof.
				</Heading>
			</Stack>
		</Box>
		<Box bg="bg.card" border="1px solid" borderColor="border.default" borderRadius="card" p={{ base: 5, md: 6 }}>
			<Stack gap={4}>
				<Text color="text.muted" fontSize="sm">
					Body / Plus Jakarta Sans
				</Text>
				<Text fontSize="lg" lineHeight="relaxed" color="text.secondary">
					Shattak copy should be warm, direct, and practical. Learners should understand the outcome quickly without
					reading a marketing-heavy paragraph.
				</Text>
				<Text fontSize="sm" lineHeight="body" color="text.muted">
					Use muted copy for metadata, helper text, and explanatory context inside cards and forms.
				</Text>
			</Stack>
		</Box>
	</SimpleGrid>
);

const ComponentsShowcase = () => (
	<SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
		<Box bg="bg.card" border="1px solid" borderColor="border.default" borderRadius="card" p={{ base: 5, md: 6 }}>
			<Stack gap={5}>
				<Stack gap={2}>
					<Text fontWeight="semibold">Buttons and badges</Text>
					<Text fontSize="sm" color="text.muted">
						Primary actions are coral-led. Secondary actions stay quiet.
					</Text>
				</Stack>
				<HStack gap={3} flexWrap="wrap">
					<Button bg="primary" color="text.inverse" _hover={{ bg: 'primaryHover' }} borderRadius="full">
						Primary action
					</Button>
					<Button variant="outline" borderRadius="full">
						Secondary action
					</Button>
					<Button bg="text.primary" color="text.inverse" _hover={{ opacity: 0.9 }} borderRadius="full">
						Dark CTA
					</Button>
				</HStack>
				<HStack gap={2} flexWrap="wrap">
					<Badge bg="bg.brand" color="text.brand" borderRadius="full" px={3} py={1}>
						Featured
					</Badge>
					<Badge bg="bg.accent" color="text.accent" borderRadius="full" px={3} py={1}>
						Live session
					</Badge>
					<Badge bg="bg.subtle" color="text.secondary" borderRadius="full" px={3} py={1}>
						Beginner
					</Badge>
				</HStack>
			</Stack>
		</Box>
		<Box bg="bg.card" border="1px solid" borderColor="border.default" borderRadius="card" p={{ base: 5, md: 6 }}>
			<Stack gap={4}>
				<Stack gap={1}>
					<Text fontWeight="semibold">Form controls</Text>
					<Text fontSize="sm" color="text.muted">
						Inputs should be calm, readable, and clearly grouped.
					</Text>
				</Stack>
				<Input placeholder="Course title" />
				<Textarea minH="110px" placeholder="Short course subtitle" />
				<Button alignSelf="flex-start" bg="primary" color="text.inverse" borderRadius="full">
					Save course
				</Button>
			</Stack>
		</Box>
	</SimpleGrid>
);

const SurfaceShowcase = () => (
	<SimpleGrid columns={{ base: 1, lg: 3 }} gap={5}>
		<Box bg="bg.card" border="1px solid" borderColor="border.default" borderRadius="card" p={5} boxShadow="card">
			<Stack gap={3}>
				<Badge alignSelf="flex-start" bg="bg.brand" color="text.brand" borderRadius="full">
					Card
				</Badge>
				<Heading fontSize="lg">Default learning card</Heading>
				<Text color="text.muted" fontSize="sm">
					Use for repeated content, compact summaries, and course proof points.
				</Text>
			</Stack>
		</Box>
		<Box
			bgGradient="var(--chakra-gradients-cta-surface)"
			_dark={{ bgGradient: 'var(--chakra-gradients-cta-surface-dark)' }}
			border="1px solid"
			borderColor="border.accentSoft"
			borderRadius="surface"
			p={5}
			boxShadow="elevated"
		>
			<Stack gap={3}>
				<Badge alignSelf="flex-start" bg="primary" color="text.inverse" borderRadius="full">
					CTA
				</Badge>
				<Heading fontSize="lg">Promotional surface</Heading>
				<Text color="text.secondary" fontSize="sm">
					Use for enrollment moments, final CTAs, and strong conversion sections.
				</Text>
			</Stack>
		</Box>
		<Box bg="bg.footer" color="text.onDark" borderRadius="surface" p={5} boxShadow="hero">
			<Stack gap={3}>
				<Badge alignSelf="flex-start" bg="primary" color="text.inverse" borderRadius="full">
					Dark
				</Badge>
				<Heading fontSize="lg">Footer or dark panel</Heading>
				<Text color="text.onDarkMuted" fontSize="sm">
					Dark surfaces should be purposeful and keep coral as the main action color.
				</Text>
			</Stack>
		</Box>
	</SimpleGrid>
);

const RadiusShadowShowcase = () => (
	<SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
		<Box bg="bg.card" border="1px solid" borderColor="border.default" borderRadius="card" p={5}>
			<Stack gap={3}>
				<Text fontWeight="semibold">Radius scale</Text>
				<SimpleGrid columns={{ base: 2, md: 3 }} gap={3}>
					{radii.map(item => (
						<Box
							key={item.token}
							bg="bg.subtle"
							borderRadius={item.token}
							border="1px solid"
							borderColor="border.default"
							p={4}
						>
							<Text fontSize="sm" fontWeight="semibold">
								{item.name}
							</Text>
							<Text fontSize="xs" color="text.muted">
								{item.value}
							</Text>
						</Box>
					))}
				</SimpleGrid>
			</Stack>
		</Box>
		<Box bg="bg.card" border="1px solid" borderColor="border.default" borderRadius="card" p={5}>
			<Stack gap={3}>
				<Text fontWeight="semibold">Shadow scale</Text>
				<SimpleGrid columns={{ base: 2, md: 3 }} gap={3}>
					{shadows.map(item => (
						<Box
							key={item.token}
							bg="bg.card"
							borderRadius="tile"
							border="1px solid"
							borderColor="border.default"
							boxShadow={item.token}
							p={4}
						>
							<Text fontSize="sm" fontWeight="semibold">
								{item.name}
							</Text>
							<Text fontSize="xs" color="text.muted">
								{item.token}
							</Text>
						</Box>
					))}
				</SimpleGrid>
			</Stack>
		</Box>
	</SimpleGrid>
);

const BrandShowcasePage = () => (
	<>
		<Header />
		<Box as="main" bg="bg.canvas">
			<Box
				bgGradient="var(--chakra-gradients-cta-surface)"
				_dark={{ bgGradient: 'var(--chakra-gradients-cta-surface-dark)' }}
				borderBottom="1px solid"
				borderColor="border.default"
				py={{ base: 12, md: 16 }}
			>
				<Container maxW="6xl">
					<Stack gap={5} maxW="4xl">
						<Badge alignSelf="flex-start" bg="primary" color="text.inverse" borderRadius="full" px={4} py={1.5}>
							Brand showcase
						</Badge>
						<Heading fontSize={{ base: '3xl', md: '5xl' }} lineHeight="display" letterSpacing="tight">
							Shattak visual system
						</Heading>
						<Text fontSize={{ base: 'md', md: 'lg' }} color="text.secondary" lineHeight="relaxed">
							A quick visual reference for colors, type, surfaces, buttons, forms, and component rhythm. Toggle the
							theme from the header to inspect dark mode.
						</Text>
						<Text fontSize="sm" color="text.muted">
							Markdown reference:{' '}
							<Box as="span" fontWeight="semibold">
								docs/brand-guidelines.md
							</Box>
						</Text>
					</Stack>
				</Container>
			</Box>
			<Container maxW="6xl" py={{ base: 8, md: 12 }}>
				<SectionShell eyebrow="Color" title="Brand palette">
					<SwatchGrid items={brandColors} />
				</SectionShell>
				<SectionShell eyebrow="Semantic color" title="Theme-aware surfaces">
					<SwatchGrid items={surfaceColors} />
				</SectionShell>
				<SectionShell eyebrow="Typography" title="Fonts and hierarchy">
					<TypographyShowcase />
				</SectionShell>
				<SectionShell eyebrow="Components" title="Common UI patterns">
					<ComponentsShowcase />
				</SectionShell>
				<SectionShell eyebrow="Surfaces" title="Cards, CTAs, and dark panels">
					<SurfaceShowcase />
				</SectionShell>
				<SectionShell eyebrow="Shape" title="Radius and elevation">
					<RadiusShadowShowcase />
				</SectionShell>
			</Container>
		</Box>
		<Footer />
	</>
);

export default BrandShowcasePage;

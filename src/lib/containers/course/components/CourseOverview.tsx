'use client';

import { Box, Button, Container, Grid, HStack, Icon, IconButton, Stack, Text } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiExternalLink } from 'react-icons/fi';

import type { CourseDetails, CourseGalleryItem } from '~/lib/containers/course/types';
import SectionHeader from '~/lib/containers/course/components/SectionHeader';

type CourseOverviewProps = {
	course: CourseDetails;
};

const CourseGalleryCarousel = ({ items }: { items: CourseGalleryItem[] }) => {
	const slides = useMemo(() => items.filter(Boolean), [items]);
	const [activeIndex, setActiveIndex] = useState(0);
	const total = slides.length;

	useEffect(() => {
		if (total <= 1) return;
		const intervalId = setInterval(() => {
			setActiveIndex(prev => (prev + 1) % total);
		}, 5000);
		return () => clearInterval(intervalId);
	}, [total]);

	const handlePrev = () => setActiveIndex(prev => (prev - 1 + total) % total);
	const handleNext = () => setActiveIndex(prev => (prev + 1) % total);

	if (total === 0) {
		return (
			<Box
				minH={{ base: '240px', md: '320px', lg: '360px' }}
				borderRadius="panel"
				bg="bg.subtle"
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Text color="text.muted">Preview coming soon</Text>
			</Box>
		);
	}

	return (
		<Stack spacing={3}>
			<Box
				position="relative"
				borderRadius="panel"
				overflow="hidden"
				bg="bg.subtle"
				minH={{ base: '240px', md: '320px', lg: '360px' }}
			>
				<Box display="flex" transition="transform 0.5s ease" transform={`translateX(-${activeIndex * 100}%)`} h="100%">
					{slides.map(item => (
						<Box key={item.id} minW="100%" position="relative" h={{ base: '240px', md: '320px', lg: '360px' }}>
							<Image src={item.image} alt={item.alt} fill sizes="600px" style={{ objectFit: 'cover' }} />
						</Box>
					))}
				</Box>

				{total > 1 ? (
					<>
						<IconButton
							aria-label="Previous preview"
							size="sm"
							variant="ghost"
							position="absolute"
							left="12px"
							top="50%"
							transform="translateY(-50%)"
							bg="bg.card"
							color="text.primary"
							border="1px solid"
							borderColor="border.default"
							boxShadow="soft"
							borderRadius="full"
							zIndex={2}
							_hover={{ bg: 'bg.subtle' }}
							onClick={handlePrev}
						>
							<FiChevronLeft />
						</IconButton>
						<IconButton
							aria-label="Next preview"
							size="sm"
							variant="ghost"
							position="absolute"
							right="12px"
							top="50%"
							transform="translateY(-50%)"
							bg="bg.card"
							color="text.primary"
							border="1px solid"
							borderColor="border.default"
							boxShadow="soft"
							borderRadius="full"
							zIndex={2}
							_hover={{ bg: 'bg.subtle' }}
							onClick={handleNext}
						>
							<FiChevronRight />
						</IconButton>
					</>
				) : null}
			</Box>

			{total > 1 ? (
				<HStack spacing={2} justify="center">
					{slides.map((item, index) => (
						<Box
							key={item.id}
							as="button"
							type="button"
							onClick={() => setActiveIndex(index)}
							w="10px"
							h="10px"
							borderRadius="full"
							bg={index === activeIndex ? 'primary' : 'bg.card'}
							border="1px solid"
							borderColor={index === activeIndex ? 'border.brand' : 'border.default'}
							transition="all 0.2s ease"
						/>
					))}
				</HStack>
			) : null}
		</Stack>
	);
};

const CourseOverview = ({ course }: CourseOverviewProps) => (
	<Box as="section" py={{ base: 12, md: 16 }}>
		<Container maxW="7xl">
			<Stack spacing={8}>
				<SectionHeader title="Outcomes Of This Sessions" subtitle="What you will build during the live classes." />

				<Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={{ base: 6, lg: 8 }} alignItems="stretch">
					<Box
						bg="bg.card"
						borderRadius="card"
						border="1px solid"
						borderColor="border.default"
						p={{ base: 4, md: 5 }}
						boxShadow="card"
					>
						<CourseGalleryCarousel items={course.projectGallery} />
					</Box>

					<Box
						bg="bg.card"
						borderRadius="card"
						border="1px solid"
						borderColor="border.default"
						p={{ base: 6, md: 7 }}
						boxShadow="card"
					>
						<Stack spacing={4}>
							<Text fontWeight="semibold" fontSize="lg">
								About the Project
							</Text>
							<Text color="text.secondary" lineHeight="relaxed">
								{course.about}
							</Text>
							<Button
								asChild
								size="sm"
								borderRadius="full"
								bg="bg.inverse"
								color="text.inverse"
								_hover={{ bg: 'bg.inverseHover' }}
								alignSelf="flex-start"
							>
								<Link href={course.liveUrl} target="_blank" rel="noopener noreferrer">
									See Live
									<Icon as={FiExternalLink} ml={2} />
								</Link>
							</Button>
						</Stack>
					</Box>
				</Grid>
			</Stack>
		</Container>
	</Box>
);

export default CourseOverview;

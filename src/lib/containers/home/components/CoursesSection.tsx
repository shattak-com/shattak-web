'use client';

import {
	Box,
	Button,
	Container,
	Heading,
	HStack,
	Icon,
	LinkBox,
	LinkOverlay,
	Separator,
	SimpleGrid,
	Stack,
	Text,
	VisuallyHidden,
	Wrap,
	WrapItem,
	Avatar
} from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { FiBarChart2, FiClock, FiStar, FiUsers, FiVideo, FiHeart  } from 'react-icons/fi';

import Reveal from '~/lib/components/Reveal';
import { courseCategories } from '~/lib/constants/landing';
import type { LandingCourseCard } from '~/lib/firebase/courses';

const formatLearners = (count: number) => {
	if (count >= 1000) {
		const rounded = Math.round(count / 100) / 10;
		const label = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
		return `${label}k+`;
	}

	return `${count}+`;
};

type CoursesSectionProps = {
	courses: LandingCourseCard[];
};

const CoursesSection = ({ courses }: CoursesSectionProps) => {
	const categories = courseCategories as readonly string[];
	const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? '');
	const headingRef = useRef<HTMLHeadingElement | null>(null);

	const filteredItems = useMemo(() => {
		if (!activeCategory) {
			return courses;
		}
		return courses.filter(item => item.categories.includes(activeCategory));
	}, [activeCategory, courses]);

	return (
		<Box as="section" id="courses" py={{ base: 14, md: 20 }}>
			<Container maxW={{ base: '6xl', xl: '7xl' }}>
				<Stack spacing={6}>
					<Box>
						<Wrap spacing={{ base: 3, md: 4 }} align="center" mb={{ base: 4, md: 6 }}>
							{categories.map(category => (
								<WrapItem key={category}>
									<Button
										size={{ base: 'xs', md: 'sm' }}
										borderRadius="full"
										bg={activeCategory === category ? 'primary' : 'bg.card'}
										color={activeCategory === category ? 'text.inverse' : 'text.primary'}
										border="2px solid"
										borderColor="border.brand"
										fontWeight="semibold"
										fontSize={{ base: 'xs', md: 'sm' }}
										px={{ base: 4, md: 6 }}
										_hover={{
											bg: activeCategory === category ? 'primaryHover' : 'bg.brand',
											color: activeCategory === category ? 'text.inverse' : 'text.primary'
										}}
										onClick={() => {
											setActiveCategory(category);
											headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
										}}
									>
										{category}
									</Button>
								</WrapItem>
							))}
						</Wrap>
					</Box>

					<Stack mb={{ base: 4, md: 6 }} spacing={2}>
						<Heading ref={headingRef} size="lg">
							Live Class From Expert Mentors
						</Heading>
					</Stack>

					<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 10, md: 12, lg: 14 }}>
						{filteredItems.map((course, index) => {
							const courseHref = `/course/${course.id}`;
							const discountPercent =
								course.price && course.originalPrice > course.price
									? Math.floor(((course.originalPrice - course.price) / course.originalPrice) * 100)
									: 0;
							return (
								<Reveal key={course.id} delay={index * 0.05} hover hoverLift={8}>
									<LinkBox
										as="article"
										bg="bg.card"
										borderRadius="card"
										p={{ base: 4, md: 5 }}
										display="flex"
										flexDirection="column"
										gap={{ base: 4, md: 5 }}
										h="100%"
										border="1px solid"
										borderColor="border.default"
										boxShadow="card"
										transition="border-color 0.2s ease, background 0.2s ease"
										_hover={{ borderColor: 'border.brandSoft', bg: 'bg.brand' }}
										cursor="pointer"
										position="relative"
									>
										<LinkOverlay
											as={Link}
											href={courseHref}
											aria-label={`View details for ${course.title}`}
											position="absolute"
											inset="0"
											zIndex={1}
										>
											<VisuallyHidden>View details</VisuallyHidden>
										</LinkOverlay>
										<Box
											position="relative"
											width="100%"
											aspectRatio="1 / 1"
											borderRadius="panel"
											overflow="hidden"
											bg="bg.subtle"
										>
											<Image
												src={course.image}
												alt={`Instructor for ${course.title}`}
												fill
												sizes="(min-width: 62em) 320px, (min-width: 48em) 45vw, 90vw"
												style={{
													objectFit: 'cover',
													objectPosition: '50% 10%'
												}}
											/>
											<HStack position="absolute"
													top={2} 
													left={3}  
													zIndex={1}
													px={1.5}
													py={1.5}
													borderRadius="full"
													bg="bg.badgeStrong"
													>
										
										
												<Avatar.Root  boxSize="25px" variant= "solid" >
													<Avatar.Image src="https://appxcontent.kaxa.in/paid_course3/2024-10-15-0.3724774982995829.png" />
												</Avatar.Root>
												<Avatar.Root  boxSize="25px" variant= "solid" >
													<Avatar.Image src="https://images.icon-icons.com/2108/PNG/512/react_icon_130845.png" />
												</Avatar.Root>
												<Avatar.Root  boxSize="25px" variant= "solid"  >
													<Avatar.Image src="https://cdn-1.webcatalog.io/catalog/vs-code/vs-code-social-preview.png?v=1714776407457" />
												</Avatar.Root>
												<Avatar.Root  boxSize="25px" variant= "solid" >
													<Avatar.Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR13ZDccP9GD690KVSsfBFZnah0zFMyDp5CIA&s" />
												</Avatar.Root>
												<Avatar.Root  boxSize="25px" variant= "solid" >
													<Avatar.Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoZAPhkIP75IVa4trptoEfFlzk-0KFEm0ibg&s" />
												</Avatar.Root>
											
											
												
											</HStack>

									

											<HStack position="absolute" top={2} right={3}  zIndex={1}>
				
												<HStack spacing={1} px={3} py={3} borderRadius="full" bg="bg.badgeStrong" boxShadow="soft">
													<Icon as={FiHeart} boxSize={6} color="red.400" _dark={{ color: 'red.400' }} />
												</HStack>
													
											</HStack>


											<HStack position="absolute" bottom={2} left={3} zIndex={1}  px={1} py={1} borderRadius="md" bg="bg.badgeStrong" boxShadow="soft">

										
													<Avatar.Root boxSize="50px" shape="sm">
													<Avatar.Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRTg-3puC1FElbQVmGS94p1eirmT7TLi9YmA&s" />
												</Avatar.Root>
											</HStack>

												<HStack position="absolute" bottom={3} right={3} spacing={2} zIndex={1} >

												<HStack
													spacing={1.5}
													px={3}
													py={1}
													borderRadius="full"
													backdropFilter="blur(8px)"
													boxShadow="soft"
													bg="bg.badgeStrong"
												>
													<Icon as={FiUsers} boxSize={3.5} color="icon.inverse" />
													<Text fontSize="xs" fontWeight="semibold" color="text.inverse">
														{formatLearners(course.learners)} Learners
													</Text>
												</HStack>

												<HStack spacing={1} px={2.5} py={1} borderRadius="full" bg="bg.badgeStrong" boxShadow="soft">
													<Icon as={FiStar} boxSize={3} color="yellow.400" _dark={{ color: 'yellow.500' }} />
													<Text fontSize="xs" fontWeight="semibold" color="text.inverse">
														{course.rating.toFixed(1)}
													</Text>
												</HStack>
													
											</HStack>


										</Box>
										<Stack spacing={3} flex="1">
											<Heading size="md" lineClamp={2} lineHeight="compact">
												{course.title}
											</Heading>
											<Separator borderColor="border.default" />
											<HStack spacing={3} color="text.muted" fontSize="xs" flexWrap="wrap">
												<HStack spacing={1}>
													<Icon as={FiBarChart2} />
													<Text>{course.level}</Text>
												</HStack>
												<HStack spacing={1}>
													<Icon as={FiClock} />
													<Text>{course.duration}</Text>
												</HStack>
												<HStack spacing={1}>
													<Icon as={FiVideo} />
													<Text>{course.format}</Text>
												</HStack>
											</HStack>
											<HStack justify="space-between" align="center" mt="auto">
												<HStack spacing={2} align="baseline">
													<Text fontSize="sm" color="text.muted" textDecoration="line-through">
														₹{course.originalPrice}
													</Text>
													<Text fontWeight="bold" fontSize="lg" color="text.primary">
														{course.price ? `₹${course.price}` : 'Free'}
													</Text>
													{discountPercent > 0 ? (
														<Text fontSize="sm" color="text.muted">
															{discountPercent}% off
														</Text>
													) : null}
												</HStack>
												<Button
													position="relative"
													zIndex={2}
													size="sm"
													borderRadius="full"
													bg="bg.inverse"
													color="text.inverse"
													_hover={{ bg: 'bg.inverseHover' }}
													asChild
												>
													<Link href={courseHref}>View Details</Link>
												</Button>
											</HStack>
										</Stack>
									</LinkBox>
								</Reveal>
							);
						})}
					</SimpleGrid>
					{!filteredItems.length ? (
						<Box
							bg="bg.card"
							border="1px solid"
							borderColor="border.default"
							borderRadius="card"
							p={{ base: 6, md: 8 }}
							textAlign="center"
						>
							<Text color="text.muted">No published courses found for this category yet.</Text>
						</Box>
					) : null}
				</Stack>
			</Container>
		</Box>
	);
};

export default CoursesSection;

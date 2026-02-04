import type { Metadata } from 'next';
import { cache } from 'react';

import CourseDetailsPage from '~/lib/containers/course';
import CourseUnavailable from '~/lib/containers/course/components/CourseUnavailable';
import type { CourseDetails } from '~/lib/containers/course/types';
import { buildScheduleDisplayItems } from '~/lib/containers/course/utils/schedule';
import { getCourseById } from '~/lib/firebase/courses';

export const dynamic = 'force-dynamic';

type CoursePageProps = {
	params: { id: string } | Promise<{ id: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const formatDescription = (course: CourseDetails) =>
	[course.summary, course.subtitle, course.about].map(value => value?.trim()).find(Boolean) ??
	`Explore ${course.title} on Shattak.`;

const formatIsoDuration = (hours: number, minutes: number) => {
	const totalMinutes = hours * 60 + minutes;
	if (!totalMinutes) {
		return null;
	}
	const durationHours = Math.floor(totalMinutes / 60);
	const durationMinutes = totalMinutes % 60;
	return `PT${durationHours ? `${durationHours}H` : ''}${durationMinutes ? `${durationMinutes}M` : ''}`;
};

const getCourse = cache(async (id: string) => getCourseById(id, { includeDrafts: true }));

export const generateMetadata = async ({ params }: CoursePageProps): Promise<Metadata> => {
	const { id: rawId } = await Promise.resolve(params);
	const id = decodeURIComponent(rawId).trim();
	const canonicalPath = `/course/${encodeURIComponent(id)}/`;

	let course: CourseDetails | null = null;
	try {
		course = await getCourse(id);
	} catch (error) {
		return {
			title: 'Course Not Available',
			description: 'The course you are looking for is currently unavailable.',
			alternates: { canonical: canonicalPath },
			robots: { index: false, follow: false }
		};
	}

	if (!course) {
		return {
			title: 'Course Not Available',
			description: 'The course you are looking for is currently unavailable.',
			alternates: { canonical: canonicalPath },
			robots: { index: false, follow: false }
		};
	}

	const description = formatDescription(course);

	if (course.status === 'Draft') {
		return {
			title: `${course.title} (Draft)`,
			description: 'This course is currently in draft and will be available once it is published.',
			alternates: { canonical: canonicalPath },
			robots: { index: false, follow: false }
		};
	}

	return {
		title: course.title,
		description,
		keywords: ['Shattak', course.title, course.category, course.level, 'live course', 'mentor-led'],
		alternates: { canonical: canonicalPath },
		openGraph: {
			title: course.title,
			description,
			type: 'website',
			url: new URL(canonicalPath, SITE_URL).toString(),
			images: [
				{
					url: course.thumbnailImage,
					alt: course.title
				}
			]
		},
		twitter: {
			card: 'summary_large_image',
			title: course.title,
			description,
			images: [course.thumbnailImage]
		}
	};
};

const CoursePage = async ({ params }: CoursePageProps) => {
	const { id: rawId } = await Promise.resolve(params);
	const id = decodeURIComponent(rawId).trim();
	let course: CourseDetails | null = null;

	try {
		course = await getCourse(id);
	} catch (error) {
		throw error;
	}

	if (!course) {
		return <CourseUnavailable variant="missing" slug={id} />;
	}

	if (course.status === 'Draft') {
		return <CourseUnavailable variant="draft" title={course.title} />;
	}

	const canonicalUrl = new URL(`/course/${encodeURIComponent(course.id)}/`, SITE_URL).toString();
	const description = formatDescription(course);
	const duration = formatIsoDuration(course.durationHours, course.durationMinutes);
	const startSession = buildScheduleDisplayItems(
		course.schedule.slice(0, 1),
		course.durationHours,
		course.durationMinutes
	)[0];
	const visibleReviews = course.reviews.filter(review => review.show);
	const ratingValue = course.rating > 0 ? Number(course.rating.toFixed(1)) : undefined;
	const faqEntries = course.faqs
		.map(faq => {
			const question = faq.question.trim();
			const answer = faq.answer.trim();
			if (!question || !answer) {
				return null;
			}
			return {
				'@type': 'Question',
				name: question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: answer
				}
			};
		})
		.filter(Boolean);

	const courseJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Course',
		name: course.title,
		description,
		provider: {
			'@type': 'Organization',
			name: 'Shattak',
			url: SITE_URL
		},
		url: canonicalUrl,
		image: [course.thumbnailImage],
		educationalLevel: course.level,
		courseMode: course.mode,
		inLanguage: 'en',
		about: course.category,
		offers: {
			'@type': 'Offer',
			url: canonicalUrl,
			priceCurrency: 'INR',
			price: course.price,
			availability: 'https://schema.org/InStock'
		},
		...(duration ? { timeRequired: duration } : {}),
		...(startSession
			? {
					hasCourseInstance: [
						{
							'@type': 'CourseInstance',
							courseMode: course.mode,
							startDate: startSession.startDate.toISOString(),
							location: {
								'@type': 'VirtualLocation',
								url: canonicalUrl
							}
						}
					]
				}
			: {}),
		...(ratingValue && visibleReviews.length
			? {
					aggregateRating: {
						'@type': 'AggregateRating',
						ratingValue,
						ratingCount: visibleReviews.length
					},
					review: visibleReviews.slice(0, 3).map(review => ({
						'@type': 'Review',
						reviewBody: review.body,
						reviewRating: {
							'@type': 'Rating',
							ratingValue: review.rating,
							bestRating: 5
						},
						author: {
							'@type': 'Person',
							name: review.name
						}
					}))
				}
			: {})
	};
	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: SITE_URL
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: course.title,
				item: canonicalUrl
			}
		]
	};
	const faqJsonLd = faqEntries.length
		? {
				'@context': 'https://schema.org',
				'@type': 'FAQPage',
				mainEntity: faqEntries
			}
		: null;

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
			{faqJsonLd ? (
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
			) : null}
			<CourseDetailsPage course={course} />
		</>
	);
};

export default CoursePage;

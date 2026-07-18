'use client';

import { Button, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { trackEnrollmentEvent, trackEnrollClicked } from '~/lib/analytics/mixpanel';
import { ApiRequestError } from '~/lib/api/client';
import { enrollInFreeCourse, getCourseEnrollmentStatus, type CourseEnrollment } from '~/lib/api/enrollments';
import type { CourseDetails } from '~/lib/containers/course/types';

type CourseEnrollActionProps = {
	course: CourseDetails;
	location: 'course_hero' | 'course_sticky_banner' | 'course_sticky_banner_mobile';
	size?: 'sm' | 'md' | 'lg';
	fullWidth?: boolean;
};

type CourseEnrollButtonProps = Pick<CourseEnrollActionProps, 'size' | 'fullWidth'>;

const isExternalLink = (value: string) => /^https?:\/\//i.test(value);

const getLearningPath = (courseId: string) => `/my-courses/${encodeURIComponent(courseId)}`;

const getButtonStyles = (fullWidth: boolean | undefined) => ({
	borderRadius: 'full',
	bg: 'text.primary',
	color: 'text.inverse',
	_hover: { bg: 'text.primary', opacity: 0.9 },
	w: fullWidth ? 'full' : undefined
});

const PaidCourseEnrollAction = ({ course, location, size, fullWidth }: CourseEnrollActionProps) => {
	const paymentLink = course.paymentLink.trim();
	const paidDestination = paymentLink || `/booking/${course.id}`;
	const openExternal = isExternalLink(paidDestination);

	return (
		<Button asChild size={size} {...getButtonStyles(fullWidth)}>
			<Link
				href={paidDestination}
				target={openExternal ? '_blank' : undefined}
				rel={openExternal ? 'noopener noreferrer' : undefined}
				onClick={() =>
					trackEnrollClicked({
						location,
						destination: paidDestination,
						courseId: course.id,
						courseTitle: course.title
					})
				}
			>
				Enroll Now
			</Link>
		</Button>
	);
};

type EnrolledCourseActionProps = CourseEnrollButtonProps & {
	course: CourseDetails;
	enrollment: CourseEnrollment;
	learningDestination: string;
	location: CourseEnrollActionProps['location'];
	message: string;
	pathname: string;
};

const EnrolledCourseAction = ({
	course,
	enrollment,
	fullWidth,
	learningDestination,
	location,
	message,
	pathname,
	size
}: EnrolledCourseActionProps) => (
	<Stack gap={2} w={fullWidth ? 'full' : undefined}>
		<Button asChild size={size} {...getButtonStyles(fullWidth)}>
			<Link
				href={learningDestination}
				onClick={() =>
					trackEnrollmentEvent({
						location,
						eventName: 'Go To Course Clicked',
						courseId: course.id,
						courseTitle: course.title,
						isFreeCourse: true,
						enrollmentStatus: enrollment.status,
						sourcePage: pathname,
						destination: learningDestination
					})
				}
			>
				Go to Course
			</Link>
		</Button>
		{message ? (
			<Text fontSize="xs" color="text.muted" textAlign="center">
				{message}
			</Text>
		) : null}
	</Stack>
);

const CourseEnrollAction = ({ course, location, size = 'sm', fullWidth = true }: CourseEnrollActionProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const isFreeCourse = course.price === 0;
	const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
	const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(isFreeCourse);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState('');
	const learningDestination = getLearningPath(course.id);
	const loginDestination = useMemo(() => `/login?redirect=${encodeURIComponent(pathname)}`, [pathname]);

	useEffect(() => {
		if (!isFreeCourse) {
			return undefined;
		}

		let isMounted = true;

		getCourseEnrollmentStatus(course.id)
			.then(result => {
				if (isMounted && result.isEnrolled) {
					setEnrollment(result.enrollment);
				}
			})
			.catch(error => {
				if (error instanceof ApiRequestError && error.statusCode === 401) {
					return;
				}

				if (isMounted) {
					setMessage('Unable to check your enrollment status right now.');
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsCheckingEnrollment(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [course.id, isFreeCourse]);

	const handleFreeEnrollment = useCallback(async () => {
		trackEnrollmentEvent({
			location,
			eventName: 'Free Course Enroll Button Clicked',
			courseId: course.id,
			courseTitle: course.title,
			isFreeCourse: true,
			sourcePage: pathname
		});

		setMessage('');
		setIsSubmitting(true);

		try {
			const result = await enrollInFreeCourse(course.id);
			setEnrollment(result.enrollment);
			setMessage(
				result.alreadyEnrolled
					? 'You are already enrolled in this course.'
					: 'You have successfully enrolled in this course.'
			);
			trackEnrollmentEvent({
				location,
				eventName: 'Free Course Enrollment Successful',
				courseId: course.id,
				courseTitle: course.title,
				isFreeCourse: true,
				enrollmentStatus: result.enrollment.status,
				sourcePage: pathname
			});
		} catch (error) {
			if (error instanceof ApiRequestError && error.statusCode === 401) {
				trackEnrollmentEvent({
					location,
					eventName: 'Logged Out User Attempted Enrollment',
					courseId: course.id,
					courseTitle: course.title,
					isFreeCourse: true,
					sourcePage: pathname,
					destination: loginDestination
				});
				router.push(loginDestination);
				return;
			}

			setMessage('Unable to enroll right now. Please try again.');
			trackEnrollmentEvent({
				location,
				eventName: 'Free Course Enrollment Failed',
				courseId: course.id,
				courseTitle: course.title,
				isFreeCourse: true,
				sourcePage: pathname,
				errorType: error instanceof ApiRequestError ? error.code : 'unknown_error'
			});
		} finally {
			setIsSubmitting(false);
		}
	}, [course.id, course.title, location, loginDestination, pathname, router]);

	if (!isFreeCourse) {
		return <PaidCourseEnrollAction course={course} location={location} size={size} fullWidth={fullWidth} />;
	}

	if (enrollment) {
		return (
			<EnrolledCourseAction
				course={course}
				enrollment={enrollment}
				fullWidth={fullWidth}
				learningDestination={learningDestination}
				location={location}
				message={message}
				pathname={pathname}
				size={size}
			/>
		);
	}

	return (
		<Stack gap={2} w={fullWidth ? 'full' : undefined}>
			<Button
				size={size}
				{...getButtonStyles(fullWidth)}
				loading={isCheckingEnrollment || isSubmitting}
				loadingText={isCheckingEnrollment ? 'Checking...' : 'Enrolling...'}
				onClick={() => {
					handleFreeEnrollment().catch(() => undefined);
				}}
			>
				Enroll Now
			</Button>
			{message ? (
				<Text fontSize="xs" color="red.500" textAlign="center">
					{message}
				</Text>
			) : null}
		</Stack>
	);
};

export default CourseEnrollAction;

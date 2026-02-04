'use client';

import { Alert, Box, Button, Container, Field, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useMemo, useState } from 'react';

import { courseDetailsMock } from '~/lib/containers/course/mock';
import type { CourseDetails } from '~/lib/containers/course/types';
import { getFirestoreDb } from '~/lib/firebase';
import { COURSES_COLLECTION } from '~/lib/firebase/courses';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const buildDraftCourse = (id: string): CourseDetails => ({
	...courseDetailsMock,
	id,
	status: 'Draft'
});

const AddCourseForm = () => {
	const [slug, setSlug] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const trimmedSlug = useMemo(() => slug.trim(), [slug]);
	const isSlugValid = trimmedSlug.length > 0 && slugPattern.test(trimmedSlug);

	const handleCreate = async () => {
		setError(null);
		setSuccess(null);

		if (!trimmedSlug) {
			setError('Enter a course slug to continue.');
			return;
		}

		if (!slugPattern.test(trimmedSlug)) {
			setError('Use lowercase letters, numbers, and hyphens only.');
			return;
		}

		setIsSubmitting(true);

		try {
			const db = getFirestoreDb();
			const courseRef = doc(db, COURSES_COLLECTION, trimmedSlug);
			const existing = await getDoc(courseRef);
			if (existing.exists()) {
				setError('This slug already exists. Please choose a different one.');
				return;
			}
			const payload = buildDraftCourse(trimmedSlug);
			await setDoc(courseRef, payload);
			setSuccess(`Draft course added to courses/${trimmedSlug}.`);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to add course.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Box as="section" py={{ base: 12, md: 16 }} bg="bg.surface">
			<Container maxW="5xl">
				<Stack spacing={6}>
					<Stack spacing={2}>
						<Heading size={{ base: 'lg', md: 'xl' }}>Add a draft course</Heading>
						<Text color="text.muted">
							Create a draft course in Firestore using the current mock data. Update the fields manually in the Firebase
							console when you are ready.
						</Text>
					</Stack>

					<Box
						bg="bg.card"
						borderRadius="card"
						border="1px solid"
						borderColor="border.default"
						p={{ base: 5, md: 6 }}
						boxShadow="card"
					>
						<Stack spacing={4}>
							<Field.Root>
								<Field.Label>
									Course slug
									<Field.RequiredIndicator />
								</Field.Label>
								<Input
									placeholder="course-html-css"
									value={slug}
									onChange={event => setSlug(event.target.value)}
									autoComplete="off"
								/>
								<Field.HelperText>Use lowercase letters, numbers, and hyphens only.</Field.HelperText>
							</Field.Root>

							<Button
								onClick={handleCreate}
								isDisabled={!isSlugValid}
								isLoading={isSubmitting}
								borderRadius="full"
								bg="primary"
								color="text.inverse"
								_hover={{ bg: 'primaryHover' }}
								alignSelf="flex-start"
							>
								Add draft course
							</Button>

							{success ? (
								<Alert.Root status="success" borderRadius="md">
									<Alert.Indicator />
									<Alert.Content>
										<Alert.Description>{success}</Alert.Description>
									</Alert.Content>
								</Alert.Root>
							) : null}

							{error ? (
								<Alert.Root status="error" borderRadius="md">
									<Alert.Indicator />
									<Alert.Content>
										<Alert.Description>{error}</Alert.Description>
									</Alert.Content>
								</Alert.Root>
							) : null}
						</Stack>
					</Box>
				</Stack>
			</Container>
		</Box>
	);
};

export default AddCourseForm;

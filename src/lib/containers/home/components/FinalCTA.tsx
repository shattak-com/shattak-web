'use client';

import {
	Box,
	Button,
	Container,
	Field,
	Heading,
	HStack,
	Input,
	SimpleGrid,
	Stack,
	Text,
	Textarea
} from '@chakra-ui/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import Reveal from '~/lib/components/Reveal';
import { scrollToId } from '~/lib/utils/scroll';

type FormValues = {
	name: string;
	contact: string;
	message: string;
};

const FinalCTA = () => {
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<FormValues>();

	const onSubmit = (data: FormValues) => {
		// eslint-disable-next-line no-console
		console.log('Lead submission', data);
	};

	const bookingUrl = process.env.NEXT_PUBLIC_RAZORPAY_BOOKING_URL;
	const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? '#cta';

	const handleBookNow = () => {
		if (bookingUrl) {
			window.open(bookingUrl, '_blank', 'noopener,noreferrer');
			return;
		}
		scrollToId('cta');
	};

	return (
		<Box as="section" id="cta" py={{ base: 14, md: 20 }}>
			<Container maxW="6xl">
				<SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 8, lg: 10 }} alignItems="center">
					<Reveal>
						<Stack spacing={4}>
							<Heading size={{ base: 'lg', md: 'xl' }}>Start learning with live classes</Heading>
							<Text color="text.muted">
								Join a mentor-led session, ask questions in real-time, and build confidence faster.
							</Text>
							<HStack spacing={4} flexWrap="wrap">
								<Button
									borderRadius="full"
									bg="primary"
									color="text.inverse"
									_hover={{ bg: 'primaryHover' }}
									onClick={handleBookNow}
								>
									Book a Class
								</Button>
								<Button asChild variant="outline" borderRadius="full" borderColor="border.default" color="text.primary">
									<Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
										Join WhatsApp
									</Link>
								</Button>
							</HStack>
						</Stack>
					</Reveal>

					<Reveal delay={0.1}>
						<Box bg="bg.card" borderRadius="card" p={{ base: 6, md: 8 }} boxShadow="elevated">
							<form onSubmit={handleSubmit(onSubmit)}>
								<Stack spacing={4}>
									<Field.Root>
										<Field.Label>
											Name
											<Field.RequiredIndicator />
										</Field.Label>
										<Input
											placeholder="Your full name"
											{...register('name', { required: 'Name is required' })}
											aria-invalid={Boolean(errors.name)}
										/>
										<Field.ErrorText>{errors.name?.message}</Field.ErrorText>
									</Field.Root>

									<Field.Root>
										<Field.Label>
											Email or Phone
											<Field.RequiredIndicator />
										</Field.Label>
										<Input
											placeholder="you@email.com"
											{...register('contact', { required: 'Contact is required' })}
											aria-invalid={Boolean(errors.contact)}
										/>
										<Field.ErrorText>{errors.contact?.message}</Field.ErrorText>
									</Field.Root>

									<Field.Root>
										<Field.Label>Message</Field.Label>
										<Textarea placeholder="What do you want to learn?" {...register('message')} />
									</Field.Root>

									<Button type="submit" borderRadius="full" bg="bg.inverse" color="text.inverse" _hover={{ bg: 'bg.inverseHover' }}>
										Submit
									</Button>
								</Stack>
							</form>
						</Box>
					</Reveal>
				</SimpleGrid>
			</Container>
		</Box>
	);
};

export default FinalCTA;

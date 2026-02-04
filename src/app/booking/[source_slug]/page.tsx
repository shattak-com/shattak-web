import BookingUnavailablePage from '~/lib/containers/booking';

type BookingPageProps = {
	params: { source_slug: string } | Promise<{ source_slug: string }>;
};

const BookingPage = async ({ params }: BookingPageProps) => {
	const { source_slug: rawSlug } = await Promise.resolve(params);
	const sourceSlug = decodeURIComponent(rawSlug).trim();

	return <BookingUnavailablePage sourceSlug={sourceSlug} />;
};

export default BookingPage;

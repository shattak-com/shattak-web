import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import NotesSubjectPage, { generateSubjectMetadata } from '~/lib/containers/notes/NotesSubjectPage';
import { parseSubjectVariant } from '~/lib/containers/notes/subject-variant';

export const revalidate = 3600;
export const dynamic = 'force-static';

type Props = { params: Promise<{ departmentSlug: string; subjectSlug: string; category: string; page: string }> };

const resolveProps = async ({ params }: Props) => {
	const values = await params;
	if (!/^(all|notes|pyq|lab)$/i.test(values.category) || !/^[0-9]{1,9}$/.test(values.page)) notFound();
	return { params: Promise.resolve(values), ...parseSubjectVariant(values.category, values.page) };
};

export const generateMetadata = async (props: Props): Promise<Metadata> =>
	generateSubjectMetadata(await resolveProps(props));

export default async function SubjectVariantPage(props: Props) {
	return <NotesSubjectPage {...await resolveProps(props)} />;
}

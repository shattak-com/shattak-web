import NotesSubjectPage, { generateSubjectMetadata } from '~/lib/containers/notes/NotesSubjectPage';

// Query variants are rewritten to path parameters before rendering.
// Reading searchParams here would opt every subject back into SSR.
export const revalidate = 3600;
export const dynamic = 'force-static';
type Props = { params: Promise<{ departmentSlug: string; subjectSlug: string }> };

export const generateMetadata = ({ params }: Props) => generateSubjectMetadata({ params });

export default function SubjectPage({ params }: Props) {
	return <NotesSubjectPage params={params} />;
}

'use client';

import { usePathname } from 'next/navigation';

import Header from '~/lib/components/layout/Header';

type UserLayoutProps = {
	children: React.ReactNode;
};

const UserLayout = ({ children }: UserLayoutProps) => {
	const pathname = usePathname();
	const isCourseWorkspace = pathname.startsWith('/my-courses/');

	return (
		<>
			{isCourseWorkspace ? null : <Header />}
			{children}
		</>
	);
};

export default UserLayout;

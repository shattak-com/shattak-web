import type { ReactNode } from 'react';

import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';

type CourseLayoutProps = {
	children: ReactNode;
};

const CourseLayout = ({ children }: CourseLayoutProps) => (
	<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
		<Header />
		<main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
		<Footer />
	</div>
);

export default CourseLayout;

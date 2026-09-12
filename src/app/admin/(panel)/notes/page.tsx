import { Suspense } from 'react';

import AdminNotesPage from '~/lib/containers/admin/notes/AdminNotesPage';

export const metadata = {
	title: 'Admin Notes'
};

const AdminNotesRoute = () => (
	<Suspense fallback={null}>
		<AdminNotesPage />
	</Suspense>
);

export default AdminNotesRoute;

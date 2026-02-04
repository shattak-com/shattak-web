import { Suspense } from 'react';

import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';
import AdminLoginForm from '~/lib/containers/admin-login/components/AdminLoginForm';

const AdminLoginPage = () => (
	<>
		<Header />
		<main>
			<Suspense fallback={null}>
				<AdminLoginForm />
			</Suspense>
		</main>
		<Footer />
	</>
);

export default AdminLoginPage;

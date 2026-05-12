import { redirect } from 'next/navigation';

const AdminPanelIndexPage = () => {
	redirect('/admin/users');
};

export default AdminPanelIndexPage;

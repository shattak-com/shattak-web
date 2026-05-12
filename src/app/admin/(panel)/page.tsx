import { redirect } from 'next/navigation';

const AdminPanelIndexPage = () => {
	redirect('/admin/courses');
};

export default AdminPanelIndexPage;

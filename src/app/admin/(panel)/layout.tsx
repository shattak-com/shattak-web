import AdminShell from '~/lib/containers/admin/components/AdminShell';

type AdminPanelLayoutProps = {
	children: React.ReactNode;
};

const AdminPanelLayout = ({ children }: AdminPanelLayoutProps) => <AdminShell>{children}</AdminShell>;

export default AdminPanelLayout;

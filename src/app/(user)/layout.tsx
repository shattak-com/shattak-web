import Header from '~/lib/components/layout/Header';

type UserLayoutProps = {
	children: React.ReactNode;
};

const UserLayout = ({ children }: UserLayoutProps) => (
	<>
		<Header />
		{children}
	</>
);

export default UserLayout;

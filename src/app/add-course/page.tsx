import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AddCoursePage from '~/lib/containers/add-course';

const ADMIN_COOKIE_NAME = 'shattak_admin';

const AddCourse = async () => {
	const cookieStore = await cookies();
	const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
	if (adminCookie !== '1') {
		redirect('/admin/login?next=/add-course');
	}

	return <AddCoursePage />;
};

export default AddCourse; 

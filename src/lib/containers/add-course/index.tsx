import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';
import AddCourseForm from '~/lib/containers/add-course/components/AddCourseForm';

const AddCoursePage = () => (
	<>
		<Header />
		<main>
			<AddCourseForm />
		</main>
		<Footer />
	</>
);

export default AddCoursePage;

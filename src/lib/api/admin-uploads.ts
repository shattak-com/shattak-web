import { postFormData } from '~/lib/api/client';

export type AdminImageUpload = {
	url: string;
	publicId: string;
	width: number;
	height: number;
	format: string;
	bytes: number;
	resourceType: string;
	originalFilename: string;
	mimeType: string;
	size: number;
};

export type AdminMediaUpload = Omit<AdminImageUpload, 'width' | 'height'> & {
	width?: number;
	height?: number;
};

export const uploadAdminImage = (file: File) => {
	const formData = new FormData();
	formData.append('image', file);

	return postFormData<{ upload: AdminImageUpload }>('/admin/uploads/image', formData);
};

export const uploadAdminMedia = (file: File) => {
	const formData = new FormData();
	formData.append('media', file);

	return postFormData<{ upload: AdminMediaUpload }>('/admin/uploads/media', formData);
};

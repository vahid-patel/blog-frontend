import { api } from './api';

export interface UploadImageResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadImageResponse>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

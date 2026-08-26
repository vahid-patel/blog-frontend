import { api } from "./api";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface UpdateProfileRequest {
  name?: string;
  prevPassword?: string;
  newPassword?: string;
}

export interface UpdateProfileResponse {
  message: string;
  updatedUser: {
    name: string;
    email: string;
  };
}

export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const response = await api.patch("/users/update", data);

  return response.data;
};

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>("/users/profile");

  return response.data;
};
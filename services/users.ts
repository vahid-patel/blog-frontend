import { api } from "./api";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>("/users/profile");

  return response.data;
};
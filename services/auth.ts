import { api } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const login = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data,
  );

  return response.data;
};

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  
}

export interface SignupResponse {
  Message: string;
}

export const signup = async (
  data: SignupRequest
): Promise<SignupResponse> => {
  const response = await api.post("/auth/signup", data);

  return response.data;
};

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
}

export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  const response = await api.post("/auth/verify-otp", data);

  return response.data;
};
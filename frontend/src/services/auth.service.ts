import { apiClient } from "./api";
import { ApiResponse } from "../types/api";
import { AuthSuccessData, LoginPayload, RegisterPayload, User } from "../types/auth";

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthSuccessData> {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>("/auth/register", payload);
    return response.data.data;
  },

  async login(payload: LoginPayload): Promise<AuthSuccessData> {
    const response = await apiClient.post<ApiResponse<AuthSuccessData>>("/auth/login", payload);
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return response.data.message ?? "If an account exists with this email, a reset link has been sent.";
  },

  async resetPassword(token: string, password: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/reset-password", { token, password });
    return response.data.message ?? "Password reset successfully. Please login.";
  },

  async me(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  }
};

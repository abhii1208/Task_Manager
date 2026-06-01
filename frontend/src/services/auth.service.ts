import { api } from "./api";
import { AuthSuccessData, LoginPayload, RegisterPayload, User } from "../types/auth";

const normalizeAuthResponse = (data: any): AuthSuccessData => {
  const token = data?.token || data?.data?.token;
  const user = data?.user || data?.data?.user;

  if (!token) {
    throw new Error("Login response did not include token.");
  }

  if (!user) {
    throw new Error("Login response did not include user.");
  }

  return { token, user };
};

const normalizeUserResponse = (data: any): User => {
  return data?.user || data?.data?.user || data?.data || data;
};

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthSuccessData> {
    const { data } = await api.post("/auth/register", payload);
    return normalizeAuthResponse(data);
  },

  async login(payload: LoginPayload): Promise<AuthSuccessData> {
    const { data } = await api.post("/auth/login", payload);
    return normalizeAuthResponse(data);
  },

  async forgotPassword(email: string): Promise<string> {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data?.message ?? "If an account exists with this email, a reset link has been sent.";
  },

  async resetPassword(token: string, password: string): Promise<string> {
    const { data } = await api.post("/auth/reset-password", { token, password });
    return data?.message ?? "Password reset successfully. Please login.";
  },

  async me(): Promise<User> {
    const { data } = await api.get("/auth/me");
    return normalizeUserResponse(data);
  }
};

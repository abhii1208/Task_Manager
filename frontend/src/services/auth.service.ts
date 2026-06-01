import { api } from "./api";
import { AuthSuccessData, LoginPayload, RegisterPayload, User } from "../types/auth";

const getTokenFromResponse = (data: any): string | undefined => {
  return data?.token || data?.data?.token || data?.accessToken;
};

const getUserFromResponse = (data: any): User | undefined => {
  return data?.user || data?.data?.user || data?.data;
};

const normalizeAuthResponse = (data: any, context: "Login" | "Registration"): AuthSuccessData => {
  const token = getTokenFromResponse(data);
  const user = getUserFromResponse(data);

  if (!token) {
    throw new Error(`${context} failed: token missing from server response.`);
  }

  if (!user) {
    throw new Error(`${context} failed: user missing from server response.`);
  }

  return { token, user };
};

const normalizeUserResponse = (data: any): User => {
  return getUserFromResponse(data) || data;
};

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthSuccessData> {
    const { data } = await api.post("/auth/register", payload);
    return normalizeAuthResponse(data, "Registration");
  },

  async login(payload: LoginPayload): Promise<AuthSuccessData> {
    const { data } = await api.post("/auth/login", payload);
    return normalizeAuthResponse(data, "Login");
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

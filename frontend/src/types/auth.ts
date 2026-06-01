export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  provider: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface AuthSuccessData {
  user: User;
  token: string;
}

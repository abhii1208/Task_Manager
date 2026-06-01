import jwt, { SignOptions } from "jsonwebtoken";

import { env } from "../config/env";

export type JwtUserPayload = {
  id: string;
  email: string;
  role: string;
};

export const signToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  } as SignOptions);
};

export const verifyToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
};

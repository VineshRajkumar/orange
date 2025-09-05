
import { User } from "@repo/database";
import { Request } from "express";

export type SafeUser = Omit<User, 'password' | 'refreshToken'>;

export interface AuthRequest extends Request {
  user?: SafeUser;
}
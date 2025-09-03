import { User } from '@prisma/client'
import { Request } from "express";

export type SafeUser = Omit<User, 'password' | 'refreshToken'>;

export interface AuthRequest extends Request {
  user?: SafeUser;
}
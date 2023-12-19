/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface TUser {
  id: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  role: 'admin' | 'student' | 'faculty';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
}

export interface UserModel extends Model<TUser> {
  // myStaticMethod(): number;
  isUserExistsByCustomId(id: string): Promise<TUser>;
  isUserDeleted(id: string): Promise<boolean>;
  isUserBlocked(id: string): Promise<boolean>;
  isPasswordMatched(
    plainPassword: string,
    hashPassword: string,
  ): Promise<TUser>;
}

export type TUserRole = keyof typeof USER_ROLE;

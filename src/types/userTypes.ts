import { UserDocument, Permissions } from '../models/User';

export type CreateUserDto = Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt' | 'disabled'>;
export type UpdateUserDto = Partial<Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>>;
export type LoginUserDto = Pick<UserDocument, 'email' | 'password'>;
export type UserResponse = Omit<UserDocument, 'password'>;
export type TokenPayload = {
  _id: string;
  permissions: Permissions;
};
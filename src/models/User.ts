import { Schema, model, Document } from 'mongoose';

export interface Permissions {
  "UPDATE-USERS": boolean;
  "DELETE-USERS": boolean;
  "CREATE-BOOKS": boolean;
  "UPDATE-BOOKS": boolean;
  "DELETE-BOOKS": boolean;
  [key: string]: boolean;
}

export interface UserDocument extends Document {
  name: string;
  idNum: string;
  email: string;
  password: string;
  permissions: Permissions;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
  },
  idNum: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  permissions: {
    type: Object,
    default: {
      "UPDATE-USERS": false,
      "DELETE-USERS": false,
      "CREATE-BOOKS": false,
      "UPDATE-BOOKS": false,
      "DELETE-BOOKS": false,
    },
  },
  disabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  versionKey: false,
});

export const User = model<UserDocument>('User', userSchema);
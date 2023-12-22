import { Schema, model } from 'mongoose';
import { TUser, UserModel } from './user.interface';
import config from '../../config';
import bcrypt from 'bcrypt';

const userSchema = new Schema<TUser, UserModel>(
  {
    id: {
      type: String,
      required: true,
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
      select: 0,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
    },
    status: {
      type: String,
      enum: ['in-progress', 'blocked'],
      default: 'in-progress',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// set empty string after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});
// statics method for check is user exists
userSchema.statics.isUserExistsByCustomId = async function (id: string) {
  return await User.findOne({ id }).select('+password');
};
// statics method for check is user isDeleted
userSchema.statics.isUserDeleted = async function (id: string) {
  const user = await User.findOne({ id });
  return user?.isDeleted;
};
// statics method for check is user is blocked
userSchema.statics.isUserBlocked = async function (id: string) {
  const user = await User.findOne({ id });
  return user?.status === 'blocked';
};
// statics method for check password match  ----
userSchema.statics.isPasswordMatched = async function (
  plainPasswords: string,
  hashPassword: string,
) {
  return await bcrypt.compare(plainPasswords, hashPassword);
};
userSchema.statics.isJWTIssuedBeforePasswordChange = async function (
  passwordChangeTimeStamp,
  jwtIssuedTimeStamp,
) {
  const passwordChangeTime = new Date(passwordChangeTimeStamp).getTime() / 1000;

  return passwordChangeTime > jwtIssuedTimeStamp;
};
export const User = model<TUser, UserModel>('User', userSchema);

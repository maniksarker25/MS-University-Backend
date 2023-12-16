import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import jwt from 'jsonwebtoken';
import config from '../../config';

const loginUser = async (payload: TLoginUser) => {
  // check if user is already exists ------
  //   const isUserExists = await User.findOne({ id: payload.id });
  const user = await User.isUserExistsByCustomId(payload.id);
  if (!(await User.isUserExistsByCustomId(payload.id))) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  // checking if the user is already deleted ------------
  if (await User.isUserDeleted(payload.id)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
  }
  // if the user is blocked
  if (await User.isUserBlocked(payload.id)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }
  // checking if the password is correct ----
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
  }
  //   Access Granted : Send Access token ,refresh token
  // create token and send to the client ------------
  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
  };
  const accessToken = jwt.sign(
    {
      data: jwtPayload,
    },
    config.jwt_access_secret as string,
    { expiresIn: '10d' },
  );
  return {
    accessToken,
    needsPasswordChange: user?.needsPasswordChange,
  };
};

export const authServices = {
  loginUser,
};

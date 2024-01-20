import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utilities/catchasync';
import AppError from '../error/appError';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';

// make costume interface

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // check if the token is sent from client -----
    const token = req?.headers?.authorization;
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Your are not authorized');
    }
    // check if the token is valid-
    // checking if the given token is valid

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
    }
    const { role, userId, iat } = decoded;

    if (!decoded) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
    }
    // get the user if that here ---------

    const user = await User.isUserExistsByCustomId(userId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }
    // checking if the user is already deleted ------------
    if (await User.isUserDeleted(userId)) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is already deleted');
    }
    // if the user is blocked
    if (await User.isUserBlocked(userId)) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
    }
    //
    if (
      user?.passwordChangedAt &&
      (await User.isJWTIssuedBeforePasswordChange(
        user?.passwordChangedAt,
        iat as number,
      ))
    ) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
    }
    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Your are not authorized');
    }
    // add those properties in req
    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;

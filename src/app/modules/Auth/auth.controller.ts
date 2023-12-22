import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import { authServices } from './auth.services';
import config from '../../config';

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body);
  const { refreshToken, accessToken, needsPasswordChange } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User login  successfully',
    data: {
      accessToken,
      // refreshToken,
      needsPasswordChange,
    },
  });
});
const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;
  const result = await authServices.changePassword(req.user, passwordData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password is updated successfully',
    data: result,
  });
});
// refresh token ----------
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully',
    data: result,
  });
});

// forget password ----------
const forgetPassword = catchAsync(async (req, res) => {
  const userId = req.body.id;
  const result = await authServices.forgetPassword(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reset link is generated successfully',
    data: result,
  });
});
// reset password ----------
const resetPassword = catchAsync(async (req, res) => {
  // const userId = req.body.id;
  const token = req?.headers?.authorization;
  const result = await authServices.resetPassword(req.body, token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully',
    data: result,
  });
});

export const authController = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};

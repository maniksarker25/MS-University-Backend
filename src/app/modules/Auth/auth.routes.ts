import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { authValidations } from './auth.validation';
import { authController } from './auth.controller';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/login',
  validateRequest(authValidations.loginValidationSchema),
  authController.loginUser,
);
router.post(
  '/change-password',
  auth(
    USER_ROLE.admin,
    USER_ROLE.faculty,
    USER_ROLE.student,
    USER_ROLE.superAdmin,
  ),
  validateRequest(authValidations.changePasswordValidationSchema),
  authController.changePassword,
);
router.post(
  '/refresh-token',
  validateRequest(authValidations.refreshTokenValidationSchema),
  authController.refreshToken,
);

router.post(
  '/forget-password',
  validateRequest(authValidations.forgetPasswordValidationSchema),
  authController.forgetPassword,
);
router.post(
  '/reset-password',
  validateRequest(authValidations.resetPasswordValidationSchema),
  authController.resetPassword,
);

export const authRoutes = router;

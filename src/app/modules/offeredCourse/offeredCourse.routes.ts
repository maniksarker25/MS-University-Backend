import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { offeredCourseControllers } from './offeredCourse.controller';
import { offeredCourseValidations } from './offeredCourse.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(offeredCourseValidations.createOfferedCourseValidationSchema),
  offeredCourseControllers.createOfferedCourse,
);
router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(offeredCourseValidations.updateOfferedCourseValidationSchema),
  offeredCourseControllers.updateOfferedCourse,
);
router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty),
  offeredCourseControllers.getAllOfferedCourse,
);
router.get(
  '/my-offered-courses',
  auth(USER_ROLE.student),
  offeredCourseControllers.getMyAllOfferedCourse,
);
router.get(
  '/:id',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.admin,
    USER_ROLE.faculty,
    USER_ROLE.student,
  ),
  offeredCourseControllers.getSingleOfferedCourse,
);
router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  offeredCourseControllers.deleteOfferedCourse,
);
export const offeredCourseRoutes = router;

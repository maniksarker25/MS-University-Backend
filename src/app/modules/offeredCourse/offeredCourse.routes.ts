import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { offeredCourseControllers } from './offeredCourse.controller';
import { offeredCourseValidations } from './offeredCourse.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(offeredCourseValidations.createOfferedCourseValidationSchema),
  offeredCourseControllers.createOfferedCourse,
);
router.patch(
  '/:id',
  validateRequest(offeredCourseValidations.updateOfferedCourseValidationSchema),
  offeredCourseControllers.updateOfferedCourse,
);
router.get('/', offeredCourseControllers.getAllOfferedCourse);
router.get('/:id', offeredCourseControllers.getSingleOfferedCourse);
export const offeredCourseRoutes = router;

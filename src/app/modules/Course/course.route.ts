import express from 'express';
import { courseControllers } from './course.controller';
import validateRequest from '../../middlewares/validateRequest';
import { courseValidations } from './course.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/create-course',
  auth('admin'),
  validateRequest(courseValidations.createCourseValidationSchema),
  courseControllers.createCourse,
);
router.get(
  '/',
  auth('admin', 'faculty', 'student'),
  courseControllers.getAllCourse,
);
router.get(
  '/:id',
  auth('admin', 'faculty', 'student'),
  courseControllers.getSingleCourse,
);
router.patch(
  '/:id',
  auth('admin'),
  validateRequest(courseValidations.updateCourseValidationSchema),
  courseControllers.updateCourse,
);
router.put(
  '/:courseId/assign-faculties',
  auth('admin'),
  validateRequest(courseValidations.facultiesWithCourseValidationSchema),
  courseControllers.assignFacultiesWithCourse,
);
router.delete(
  '/:courseId/remove-faculties',
  auth('admin'),
  validateRequest(courseValidations.facultiesWithCourseValidationSchema),
  courseControllers.removeFacultiesFromCourse,
);
router.patch('/:id', courseControllers.deleteCourse);

export const courseRoutes = router;

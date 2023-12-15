import express from 'express';
import { courseControllers } from './course.controller';
import validateRequest from '../../middlewares/validateRequest';
import { courseValidations } from './course.validation';

const router = express.Router();

router.post(
  '/create-course',
  validateRequest(courseValidations.createCourseValidationSchema),
  courseControllers.createCourse,
);
router.get('/', courseControllers.getAllCourse);
router.get('/:id', courseControllers.getSingleCourse);
router.patch(
  '/:id',
  validateRequest(courseValidations.updateCourseValidationSchema),
  courseControllers.updateCourse,
);
router.put(
  '/:courseId/assign-faculties',
  validateRequest(courseValidations.facultiesWithCourseValidationSchema),
  courseControllers.assignFacultiesWithCourse,
);
router.delete(
  '/:courseId/remove-faculties',
  validateRequest(courseValidations.facultiesWithCourseValidationSchema),
  courseControllers.removeFacultiesFromCourse,
);
router.patch('/:id', courseControllers.deleteCourse);

export const courseRoutes = router;

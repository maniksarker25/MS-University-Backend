import express from 'express';
import { StudentControllers } from './student.controller';
import validateRequest from '../../middlewares/validateRequest';
import { updateStudentValidationSchema } from './student.validation';

const router = express.Router();

// this routers will call controller --------
router.get('/all-students', StudentControllers.getAllStudents);
router.get('/:studentId', StudentControllers.getSingleStudent);
router.patch(
  '/:studentId',
  validateRequest(updateStudentValidationSchema),
  StudentControllers.updateStudent,
);
router.delete('/:studentId', StudentControllers.deleteSingleStudent);
export const StudentRoutes = router;

import express from 'express';
import { StudentControllers } from './student.controller';
import validateRequest from '../../middlewares/validateRequest';
import { updateStudentValidationSchema } from './student.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

// this routers will call controller --------
router.get('/', StudentControllers.getAllStudents);
router.get(
  '/:id',
  auth('admin', 'faculty', 'student'),
  StudentControllers.getSingleStudent,
);
router.patch(
  '/:id',
  validateRequest(updateStudentValidationSchema),
  StudentControllers.updateStudent,
);
router.delete('/:id', StudentControllers.deleteSingleStudent);
export const StudentRoutes = router;

import express from 'express';
import { StudentControllers } from './student.controller';

const router = express.Router();

// this routers will call controller --------
router.get('/all-students', StudentControllers.getAllStudents);
router.get('/:studentId', StudentControllers.getSingleStudent);
router.delete('/:studentId', StudentControllers.deleteSingleStudent);
export const StudentRoutes = router;

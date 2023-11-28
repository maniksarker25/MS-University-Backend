import { Router } from 'express';
import { AcademicSemesterControllers } from './academicSemester.controller';

const router = Router();

router.post(
  '/create-academic-semester',
  AcademicSemesterControllers.createAcademicSemester,
);

export const AcademicSemesterRoutes = router;

import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { StudentRoutes } from '../modules/student/student.route';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.routes';
import { AcademicFacultyRoutes } from '../modules/academicFaculty/academicFaculty.routes';
import { AcademicDepartmentRoutes } from '../modules/academicDepartment/academicDepartment.routes';
import { FacultyRoutes } from '../modules/Faculty/faculty.route';
import { AdminRoutes } from '../modules/Admin/admin.route';
import { courseRoutes } from '../modules/Course/course.route';
import { semesterRegistrationRoutes } from '../modules/semesterRegistration/semesterRegistration.routes';
import { offeredCourseRoutes } from '../modules/offeredCourse/offeredCourse.routes';
import { authRoutes } from '../modules/Auth/auth.routes';
import { enrolledCourseRoutes } from '../modules/enrolledCourse/enrolledCourse.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    router: UserRoutes,
  },
  {
    path: '/students',
    router: StudentRoutes,
  },
  {
    path: '/faculties',
    router: FacultyRoutes,
  },
  {
    path: '/admins',
    router: AdminRoutes,
  },
  {
    path: '/academic-semesters',
    router: AcademicSemesterRoutes,
  },
  {
    path: '/academic-faculties',
    router: AcademicFacultyRoutes,
  },
  {
    path: '/academic-departments',
    router: AcademicDepartmentRoutes,
  },
  {
    path: '/courses',
    router: courseRoutes,
  },
  {
    path: '/semester-registrations',
    router: semesterRegistrationRoutes,
  },
  {
    path: '/offered-courses',
    router: offeredCourseRoutes,
  },
  {
    path: '/auth',
    router: authRoutes,
  },
  {
    path: '/enrolled-courses',
    router: enrolledCourseRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;

import AppError from '../../error/appError';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { TOfferedCourse } from './offeredCourse.interface';
import { OfferedCourse } from './offeredCourse.model';
import { AcademicFaculty } from '../academicFaculty/academicFaculty.model';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { Course } from '../Course/course.model';
import { Faculty } from '../Faculty/faculty.model';
import { hasTimeConflict } from './offeredCourse.utilities';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import { Student } from '../student/student.model';

const createOfferedCourseIntoDB = async (payload: TOfferedCourse) => {
  const {
    semesterRegistration,
    academicFaculty,
    academicDepartment,
    course,
    section,
    faculty,
    days,
    startTime,
    endTime,
  } = payload;
  // check semester registration id is existing ----------
  const isSemesterRegistrationExists =
    await SemesterRegistration.findById(semesterRegistration);
  if (!isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Semester registration is not found',
    );
  }
  // get academic semester from registration semester
  const academicSemester = isSemesterRegistrationExists.academicSemester;
  // check academic faculty is existing ----------
  const isAcademicFacultyExists =
    await AcademicFaculty.findById(academicFaculty);
  if (!isAcademicFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic faculty is not found');
  }
  // check academic department is existing ----------
  const isAcademicDepartmentExists =
    await AcademicDepartment.findById(academicDepartment);
  if (!isAcademicDepartmentExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Academic department is not found',
    );
  }
  // check course is existing ----------
  const isCourseExists = await Course.findById(course);
  if (!isCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course is not found');
  }
  // check faculty is existing ----------
  const isFacultyExists = await Faculty.findById(faculty);
  if (!isFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty is not found');
  }
  // check if the faculty is belong to the academic faculty
  const isDepartmentBelongsToAcademicFaculty = await AcademicDepartment.findOne(
    {
      academicFaculty,
      _id: academicDepartment,
    },
  );
  ///---------------------
  if (!isDepartmentBelongsToAcademicFaculty) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This ${isAcademicDepartmentExists.name} is not belong to this ${isAcademicFacultyExists.name}`,
    );
  }
  // check if the same course same section in the same registered semester ---
  const isSameOfferedCourseExistsWithSameRegisteredSemesterWithSameSection =
    await OfferedCourse.findOne({
      semesterRegistration,
      course,
      section,
    });
  if (isSameOfferedCourseExistsWithSameRegisteredSemesterWithSameSection) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Offered course with same section is already exists`,
    );
  }
  // get the schedule of the faculties ----------
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime');
  // console.log(assignedSchedules);
  const newSchedule = {
    days,
    startTime,
    endTime,
  };
  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `This faculty is not available at that time? choose other time or date`,
    );
  }
  const result = await OfferedCourse.create({ ...payload, academicSemester });
  return result;
};
// update offered course ---------
const updateOfferedCourseIntoDB = async (
  id: string,
  payload: Pick<TOfferedCourse, 'faculty' | 'days' | 'startTime' | 'endTime'>,
) => {
  const { faculty, days, startTime, endTime } = payload;
  // check offered course exists or not
  const isOfferedCourseExists = await OfferedCourse.findById(id);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This offered course not found');
  }
  //check faculty exists or not
  const isFacultyExists = await Faculty.findById(faculty);
  if (!isFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This faculty is not exists');
  }
  const semesterRegistration = isOfferedCourseExists.semesterRegistration;
  const semesterRegistrationStatus =
    await SemesterRegistration.findById(semesterRegistration);
  if (semesterRegistrationStatus?.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not update this offered course as it ${semesterRegistrationStatus?.status} `,
    );
  }
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime');
  const newSchedule = {
    days,
    startTime,
    endTime,
  };
  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `This faculty is not available at that time! choose other time or date`,
    );
  }
  const result = await OfferedCourse.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};
// get all offered course from Db
const getAllOfferedCourseFromDB = async (query: Record<string, unknown>) => {
  const offeredCourseQuery = new QueryBuilder(OfferedCourse.find(), query)
    .filter()
    .paginate()
    .sort()
    .fields();
  const result = await offeredCourseQuery.modelQuery;
  const meta = await offeredCourseQuery.countTotal();
  return {
    meta,
    result,
  };
};
// get all offered course from Db
const getMyAllOfferedCourseFromDB = async (userId: string) => {
  // find the student
  const student = await Student.findOne({ id: userId });
  // console.log(student);
  // console.log(student?.academicDepartment, student?.academicFaculty);
  if (!student) {
    throw new AppError(404, 'User is not found');
  }
  // find current ongoing registration semester
  const currentOngoingRegistrationSemester = await SemesterRegistration.findOne(
    {
      status: 'ONGOING',
    },
  );
  if (!currentOngoingRegistrationSemester) {
    throw new AppError(404, 'There is no registration semester ongoing');
  }
  //
  const result = await OfferedCourse.aggregate([
    {
      $match: {
        semesterRegistration: currentOngoingRegistrationSemester?._id,
        academicFaculty: student.academicFaculty,
        academicDepartment: student.academicDepartment,
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: '$course',
    },
    {
      $lookup: {
        from: 'enrolledcourses',
        let: {
          currentOngoingRegistrationSemester:
            currentOngoingRegistrationSemester._id,
          currentStudent: student._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      '$semesterRegistration',
                      '$$currentOngoingRegistrationSemester',
                    ],
                  },
                  {
                    $eq: ['$student', '$$currentStudent'],
                  },
                  {
                    $eq: ['$isEnrolled', true],
                  },
                ],
              },
            },
          },
        ],
        as: 'enrolledCourses',
      },
    },
    {
      $addFields: {
        isAlreadyEnrolled: {
          $in: [
            '$course._id',
            {
              $map: {
                input: '$enrolledCourses',
                as: 'enroll',
                in: '$$enroll.course',
              },
            },
          ],
        },
      },
    },
    {
      $match: {
        isAlreadyEnrolled: false,
      },
    },
  ]);
  return result;
};
// get single offered course
const getSingleOfferedCourseFromDB = async (id: string) => {
  const offeredCourse = await OfferedCourse.findById(id);

  if (!offeredCourse) {
    throw new AppError(404, 'Offered Course not found');
  }

  return offeredCourse;
};
// delete offered course
const deleteOfferedCourseFromDB = async (id: string) => {
  /**
   * Step 1: check if the offered course exists
   * Step 2: check if the semester registration status is upcoming
   * Step 3: delete the offered course
   */
  const isExistsOfferedCourse = await OfferedCourse.findById(id);
  if (!isExistsOfferedCourse) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course is not found');
  }
  const semesterRegistrationStatus = await SemesterRegistration.findById(
    isExistsOfferedCourse.semesterRegistration,
  ).select('status');
  // console.log(semesterRegistrationStatus);
  if (semesterRegistrationStatus?.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Offered course can not delete ! because the semester ${semesterRegistrationStatus}`,
    );
  }
  const result = await OfferedCourse.findByIdAndDelete(id);

  return result;
};

export const offeredCourseServices = {
  createOfferedCourseIntoDB,
  updateOfferedCourseIntoDB,
  getAllOfferedCourseFromDB,
  getMyAllOfferedCourseFromDB,
  getSingleOfferedCourseFromDB,
  deleteOfferedCourseFromDB,
};

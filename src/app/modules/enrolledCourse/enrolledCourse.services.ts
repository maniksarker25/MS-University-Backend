/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { OfferedCourse } from '../offeredCourse/offeredCourse.model';
import { TEnrolledCourse } from './enrolledCourse.interface';
import { Student } from '../student/student.model';
import EnrolledCourse from './enrolledCourse.model';
import mongoose from 'mongoose';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { Course } from '../Course/course.model';

const createEnrolledCourseIntoDB = async (
  userId: string,
  payload: TEnrolledCourse,
) => {
  /*
   *Step1: Check if the offered course is exists
   *Step2: Check if the student already exists
   *Step3: Check if the max credits exceeded
   *Step4: Create an enrolled Course
   
   */
  const { offeredCourse } = payload;
  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
  if (!isOfferedCourseExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This offered course course does not exist',
    );
  }

  // check if offerCourse max capacity is <0
  if (isOfferedCourseExists.maxCapacity <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Capacity is full');
  }

  const student = await Student.findOne({ id: userId }, { _id: 1 });
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  }
  //   console.log(student);
  const isStudentAlreadyEnrolled = await EnrolledCourse.findOne({
    semesterRegistration: isOfferedCourseExists?.semesterRegistration,
    offeredCourse,
    student: student._id,
  });
  if (isStudentAlreadyEnrolled) {
    throw new AppError(httpStatus.CONFLICT, 'Student is already enrolled');
  }

  // check total credits + new enrolled credit > max credits------------------------------------------
  // find existing course --------
  const course = await Course.findById(isOfferedCourseExists.course);
  // find existing semesterRegistration --------
  const semesterRegistration = await SemesterRegistration.findById(
    isOfferedCourseExists.semesterRegistration,
  ).select('maxCredit');

  const maxCredits = semesterRegistration?.maxCredit;

  //
  const enrolledCourses = await EnrolledCourse.aggregate([
    {
      $match: {
        semesterRegistration: isOfferedCourseExists.semesterRegistration,
        student: student._id,
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'enrolledCourseData',
      },
    },
    {
      $unwind: '$enrolledCourseData',
    },
    {
      $group: {
        _id: null,
        totalEnrolledCredits: { $sum: '$enrolledCourseData.credits' },
      },
    },
    {
      $project: { _id: 0, totalEnrolledCredits: 1 },
    },
  ]);
  // console.log(enrolledCourses);
  // check total credits + new enrolled credit > max credits-----
  const totalEnrolledCredits =
    enrolledCourses.length > 0 ? enrolledCourses[0].totalEnrolledCredits : 0;
  if (
    totalEnrolledCredits &&
    maxCredits &&
    totalEnrolledCredits + course?.credits > maxCredits
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have exceeded the maximum credits',
    );
  }
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await EnrolledCourse.create(
      [
        {
          semesterRegistration: isOfferedCourseExists.semesterRegistration,
          academicSemester: isOfferedCourseExists.academicSemester,
          academicFaculty: isOfferedCourseExists.academicFaculty,
          academicDepartment: isOfferedCourseExists.academicDepartment,
          offeredCourse: offeredCourse,
          course: isOfferedCourseExists.course,
          student: student._id,
          faculty: isOfferedCourseExists.faculty,
          isEnrolled: true,
        },
      ],
      { session },
    );
    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to enrolled in this course',
      );
    }
    const maxCapacity = isOfferedCourseExists.maxCapacity;
    await OfferedCourse.findByIdAndUpdate(offeredCourse, {
      maxCapacity: maxCapacity - 1,
    });
    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

// update course marks into db
const updateEnrolledCourseMarksIntoDB = async (
  facultyId: string,
  payload: Partial<TEnrolledCourse>,
) => {
  const { semesterRegistration, offeredCourse, student, courseMarks } = payload;

  // check if the semester registration exists -
  const isSemesterRegistrationExists =
    await SemesterRegistration.findById(semesterRegistration);
  if (!isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Semester registration is not found',
    );
  }
  // check if the offeredCourse exists -
  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered course is not found');
  }
  // check if the student exists -
  const isStudentExists = await Student.findById(student);
  if (!isStudentExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student is not found');
  }
};

export const enrolledCourseServices = {
  createEnrolledCourseIntoDB,
  updateEnrolledCourseMarksIntoDB,
};

import mongoose from 'mongoose';
import config from '../../config';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateStudentId } from './user.utilis';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const createStudentIntoDB = async (password: string, studentData: TStudent) => {
  // create a user
  const userData: Partial<TUser> = {};

  //if password is not provided then use default password
  userData.password = password || (config.default_pass as string);
  // set student role
  userData.role = 'student';

  const admissionSemester = await AcademicSemester.findById(
    studentData.admissionSemester,
  );

  // use transaction and rollback
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    if (admissionSemester) {
      userData.id = await generateStudentId(admissionSemester);
    }
    // create new user(transaction1)
    const newUser = await User.create([userData], { session });
    // now create a student -----------------------
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }
    // set id , _id as user
    studentData.id = newUser[0].id;
    studentData.user = newUser[0]._id; // reference id

    // create new student(transaction2)
    const newStudent = await Student.create([studentData], { session });
    if (!newStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create student');
    }

    await session.commitTransaction();
    await session.endSession();
    return newStudent;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
    // console.log(error);
  }
};

export const UserService = {
  createStudentIntoDB,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import config from '../../config';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import {
  generateAdminId,
  generateFacultyId,
  generateStudentId,
} from './user.utilis';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { TFaculty } from '../Faculty/faculty.interface';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { Faculty } from '../Faculty/faculty.model';
import { Admin } from '../Admin/admin.model';
import { sendImageToCloudinary } from '../../utilities/sendImageToCloudinary';

const createStudentIntoDB = async (
  file: any,
  password: string,
  studentData: TStudent,
) => {
  // create a user
  const userData: Partial<TUser> = {};

  //if password is not provided then use default password
  userData.password = password || (config.default_pass as string);
  // set student role
  userData.role = 'student';
  userData.email = studentData.email;

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

    const imageName = `${userData?.id}${studentData?.name?.firstName}`;

    // send image to cloudinary --------
    const { secure_url } = await sendImageToCloudinary(imageName, file?.path);
    // console.log(profileImage);
    // create new user(transaction1)
    const newUser = await User.create([userData], { session });
    // now create a student -----------------------
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }
    // set id , _id as user
    studentData.id = newUser[0].id;
    studentData.user = newUser[0]._id; // reference id
    studentData.profileImage = secure_url;

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

const createFacultyIntoDB = async (password: string, payload: TFaculty) => {
  // create a user object
  const userData: Partial<TUser> = {};

  //if password is not given , use deafult password
  userData.password = password || (config.default_pass as string);

  //set student role
  userData.role = 'faculty';
  userData.email = payload.email;

  // find academic department info
  const academicDepartment = await AcademicDepartment.findById(
    payload.academicDepartment,
  );

  if (!academicDepartment) {
    throw new AppError(400, 'Academic department not found');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set  generated id
    userData.id = await generateFacultyId();

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session }); // array

    //create a faculty
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }
    // set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //reference _id

    // create a faculty (transaction-2)

    const newFaculty = await Faculty.create([payload], { session });

    if (!newFaculty.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create faculty');
    }

    await session.commitTransaction();
    await session.endSession();

    return newFaculty;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const createAdminIntoDB = async (password: string, payload: TFaculty) => {
  // create a user object
  const userData: Partial<TUser> = {};

  //if password is not given , use deafult password
  userData.password = password || (config.default_pass as string);

  //set student role
  userData.role = 'admin';
  userData.email = payload.email;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set  generated id
    userData.id = await generateAdminId();

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session });

    //create a admin
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin');
    }
    // set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //reference _id

    // create a admin (transaction-2)
    const newAdmin = await Admin.create([payload], { session });

    if (!newAdmin.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin');
    }

    await session.commitTransaction();
    await session.endSession();

    return newAdmin;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

// get me ------
const getMe = async (userId: string, role: string) => {
  let result = null;
  if (role === 'student') {
    result = await Student.findOne({ id: userId })
      .populate('user')
      .populate('admissionSemester')
      .populate({
        path: 'academicDepartment',
        populate: { path: 'academicFaculty' },
      });
  }
  if (role === 'faculty') {
    result = await Faculty.findOne({ id: userId }).populate('user');
  }
  if (role === 'admin') {
    result = await Admin.findOne({ id: userId }).populate('user');
  }
  return result;
};
// change user status ----------------
const changeUserStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, { new: true });
  return result;
};
export const UserService = {
  createStudentIntoDB,
  createFacultyIntoDB,
  createAdminIntoDB,
  getMe,
  changeUserStatus,
};

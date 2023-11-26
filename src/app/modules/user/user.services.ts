import config from '../../config';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';

const createStudentIntoDB = async (password: string, studentData: TStudent) => {
  // create a user
  const userData: Partial<TUser> = {};

  //if password is not provided then use default password
  userData.password = password || (config.default_pass as string);
  // set student role
  userData.role = 'student';

  // set manually generated id
  userData.id = '2030100001';
  // create new user
  const newUser = await User.create(userData);

  // now create a student -----------------------
  if (Object.keys(newUser).length) {
    // set id , _id as user
    studentData.id = newUser.id;
    studentData.user = newUser._id; // reference id
    const newStudent = await Student.create(studentData);
    return newStudent;
  }
};

export const UserService = {
  createStudentIntoDB,
};

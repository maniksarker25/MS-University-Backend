import config from '../../config';
import { TAcademicSemester } from '../academicSemester/academicSemester.interface';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateStudentId } from './user.utilis';

const createStudentIntoDB = async (password: string, studentData: TStudent) => {
  // create a user
  const userData: Partial<TUser> = {};

  //if password is not provided then use default password
  userData.password = password || (config.default_pass as string);
  // set student role
  userData.role = 'student';

  // year + semester code + 4 digit number for student id
  // come form user.utilis file--------------
  // find academic semester info ---------
  const admissionSemester = await AcademicSemester.findById(
    studentData.admissionSemester,
  );
  // setgenerated id
  // userData.id = generateStudentId(admissionSemester);
  if (admissionSemester) {
    userData.id = await generateStudentId(admissionSemester);
  }
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

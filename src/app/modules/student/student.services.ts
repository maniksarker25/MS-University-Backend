import { TStudent } from './student.interface';
import { Student } from './student.model';

const createStudentIntoDB = async (studentData: TStudent) => {
  //--------------- use our costume static method --------------------

  if (await Student.isUserExists(studentData.id)) {
    throw new Error('Student already exists');
  }
  // --------------use build in static method --------------------
  const result = await Student.create(studentData);

  //--------------- use our costume static method --------------------

  // if (await Student.isUserExists(studentData.id)) {
  //   throw new Error('Student already exists');
  // }

  // --------------use build in  instance method------------------------
  // const student = new Student(studentData);

  // -------------using  our costume instance method --------------
  // -----------------
  // if (await student.isUserExists(studentData.id)) {
  //   throw new Error('Student already exists');
  // }
  //------------------------

  // const result = await student.save();

  return result;
};

const getAllStudentsFromDB = async () => {
  const result = await Student.find();
  return result;
};
const getSingleStudentFromDB = async (id: string) => {
  // const result = await Student.findOne({ id });
  const result = await Student.aggregate([{ $match: { id: id } }]);
  return result;
};
const deleteSingleStudentFromDB = async (id: string) => {
  const result = await Student.updateOne({ id }, { isDeleted: true });
  return result;
};

export const StudentServices = {
  createStudentIntoDB,
  getAllStudentsFromDB,
  getSingleStudentFromDB,
  deleteSingleStudentFromDB,
};

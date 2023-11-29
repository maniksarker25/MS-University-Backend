import { TAcademicFaculty } from './academicFaculty.interface';
import { AcademicFaculty } from './academicFaculty.model';

const createAcademicFacultyIntoDB = async (payload: TAcademicFaculty) => {
  const result = await AcademicFaculty.create(payload);
  return result;
};

// get all academicFaculty -------
const getAllAcademicFacultiesFromDB = async () => {
  const result = await AcademicFaculty.find();
  return result;
};
// get single academicFaculty--------
const getSingleAcademicFacultyFromDB = async (id: string) => {
  const result = await AcademicFaculty.findById(id);
  return result;
};
// update a single AcademicFaculty --------
const updateSingleAcademicFacultyFromDB = async (
  id: string,
  payload: Partial<TAcademicFaculty>,
) => {
  const result = await AcademicFaculty.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

export const AcademicFacultyServices = {
  createAcademicFacultyIntoDB,
  getAllAcademicFacultiesFromDB,
  getSingleAcademicFacultyFromDB,
  updateSingleAcademicFacultyFromDB,
};

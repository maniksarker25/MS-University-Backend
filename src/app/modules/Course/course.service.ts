import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { courseSearchableFields } from './course.constant';
import { TCourse, TCourseFaculty } from './course.interface';
import { Course, CourseFaculty } from './course.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const createCourseIntoDB = async (payload: TCourse) => {
  const result = await Course.create(payload);
  return result;
};
// get all course form db
const getAllCoursesFromDB = async (query: Record<string, unknown>) => {
  const courseQuery = new QueryBuilder(
    Course.find().populate('preRequisiteCourses.course'),
    // for get all nested prerequisite courses
    // Course.find().populate({
    //   path: 'preRequisiteCourses.course',
    //   populate: {
    //     path: 'preRequisiteCourses.course', // Assuming nested prerequisites
    //     model: 'course', // Replace 'Course' with your actual model name
    //   },
    // }),
    query,
  )
    .search(courseSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await courseQuery.modelQuery;
  return result;
};

// get single course from db
const getSingleCourseFromDB = async (id: string) => {
  const result = await Course.findById(id).populate(
    'preRequisiteCourses.course',
  );
  return result;
};

// update course --------
const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {
  const { preRequisiteCourses, ...remainingCourseData } = payload;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // step 1: update basic course data -------
    const updatedBasicCourseData = await Course.findByIdAndUpdate(
      id,
      remainingCourseData,
      { new: true, runValidators: true, session },
    );
    if (!updatedBasicCourseData) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
    }
    // check there is any prerequisites course then update
    if (preRequisiteCourses && preRequisiteCourses.length > 0) {
      // filter deleted prerequisites course
      const deletedPrerequisitesCourses = preRequisiteCourses
        .filter((el) => el.course && el.isDeleted)
        .map((el) => el.course);
      // console.log(deletedPrerequisitesCourses);
      const deletePrerequisitesCourses = await Course.findByIdAndUpdate(
        id,
        {
          $pull: {
            preRequisiteCourses: {
              course: { $in: deletedPrerequisitesCourses },
            },
          },
        },
        { new: true, runValidators: true, session },
      );
      if (!deletePrerequisitesCourses) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
      }
      // filter new prerequisites course
      const newPreRequisiteCourses = preRequisiteCourses?.filter(
        (el) => el.course && !el.isDeleted,
      );
      // console.log({ newPreRequisiteCourses });
      const addNewPrerequisitesCourses = await Course.findByIdAndUpdate(
        id,
        {
          $addToSet: { preRequisiteCourses: { $each: newPreRequisiteCourses } },
        },
        { new: true, runValidators: true, session },
      );
      if (!addNewPrerequisitesCourses) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
      }
    }
    await session.commitTransaction();
    await session.endSession();
    const result = await Course.findById(id).populate(
      'preRequisiteCourses.course',
    );

    return result;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
  }
};

// assign faculties
const assignFacultiesWithCourseIntoDB = async (
  id: string,
  payload: Partial<TCourseFaculty>,
) => {
  const result = await CourseFaculty.findByIdAndUpdate(
    id,
    {
      course: id,
      $addToSet: { faculties: { $each: payload } },
    },
    { upsert: true, new: true },
  );
  return result;
};

// remove faculties from courses
const removeFacultiesFromCourseFromDB = async (
  id: string,
  payload: Partial<TCourseFaculty>,
) => {
  const result = await CourseFaculty.findByIdAndUpdate(
    id,
    {
      $pull: { faculties: { $in: payload } },
    },
    { upsert: true, new: true },
  );
  return result;
};

// delete course --------
const deleteCourseFromDB = async (id: string) => {
  const result = await Course.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return result;
};

export const courseServices = {
  createCourseIntoDB,
  getAllCoursesFromDB,
  getSingleCourseFromDB,
  updateCourseIntoDB,
  assignFacultiesWithCourseIntoDB,
  removeFacultiesFromCourseFromDB,
  deleteCourseFromDB,
};

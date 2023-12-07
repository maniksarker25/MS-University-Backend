import { Schema, model } from 'mongoose';
import { TCourse, TPreRequisiteCourses } from './course.interface';

const preRequisiteCoursesSchema = new Schema<TPreRequisiteCourses>({
  course: {
    type: Schema.ObjectId,
    ref: 'course',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const courseSchema = new Schema<TCourse>({
  title: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  prefix: {
    type: String,
    trim: true,
    required: true,
  },
  code: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
    trim: true,
  },
  preRequisiteCourses: {
    type: [preRequisiteCoursesSchema],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

export const Course = model<TCourse>('course', courseSchema);

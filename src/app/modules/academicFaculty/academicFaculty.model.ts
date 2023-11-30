import { Schema, model } from 'mongoose';
import { TAcademicFaculty } from './academicFaculty.interface';

const academicFacultySchema = new Schema<TAcademicFaculty>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);
// create pre method for checking existing faculty for create faculty
academicFacultySchema.pre('save', async function (next) {
  const isDepartmentExists = await AcademicFaculty.findOne({
    name: this.name,
  });
  if (isDepartmentExists) {
    throw new Error('This Faculty already exists');
  }
  next();
});

// create pre method for checking existing faculty for update faculty
academicFacultySchema.pre('findOneAndUpdate', async function (next) {
  const query = this.getQuery();
  const isDepartmentExists = await AcademicFaculty.findOne(query);
  if (!isDepartmentExists) {
    throw new Error('This Faculty does not exists');
  }
  next();
});

export const AcademicFaculty = model<TAcademicFaculty>(
  'AcademicFaculty',
  academicFacultySchema,
);

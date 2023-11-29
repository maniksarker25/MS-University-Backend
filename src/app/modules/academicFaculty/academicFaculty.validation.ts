import { z } from 'zod';

const createAcademicFacultyValidationSchema = z.object({
  body: z.object({
    name: z.string({
      invalid_type_error: 'Academic faculty must be a string',
    }),
  }),
});
const updateAcademicFacultyValidationSchema = z.object({
  body: z.object({
    name: z.string({
      invalid_type_error: 'Academic faculty must be a string',
    }),
  }),
});

export const academicFacultyValidations = {
  createAcademicFacultyValidationSchema,
  updateAcademicFacultyValidationSchema,
};

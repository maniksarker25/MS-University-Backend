import { z } from 'zod';

const createEnrolledCourseValidationSchema = z.object({
  body: z.object({
    offeredCourse: z.string({ required_error: 'offeredCourse is required' }),
  }),
});

export const enrolledCourseValidations = {
  createEnrolledCourseValidationSchema,
};

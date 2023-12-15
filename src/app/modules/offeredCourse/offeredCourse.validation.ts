import { z } from 'zod';
import { Days } from './offeredCourse.constant';

const createOfferedCourseValidationSchema = z.object({
  body: z
    .object({
      semesterRegistration: z.string(),
      academicFaculty: z.string(),
      academicDepartment: z.string(),
      course: z.string(),
      faculty: z.string(),
      maxCapacity: z.number(),
      section: z.number(),
      days: z.array(z.enum([...Days] as [string, ...string[]])),
      startTime: z.string().refine(
        (time) => {
          const timePattern = /^(?:[0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
          return timePattern.test(time);
        },
        { message: "Invalid time format,expected 'HH:MM' in 24 hours format" },
      ),
      endTime: z.string().refine(
        (time) => {
          const timePattern = /^(?:[0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
          return timePattern.test(time);
        },
        { message: "Invalid time format,expected 'HH:MM' in 24 hours format" },
      ),
    })
    .refine(
      (body) => {
        // startDate => 1970-01-01T10:30
        // endDate => 1970-01-01T12:30
        const start = new Date(`1970-01-01T${body.startTime}:00`);
        const end = new Date(`1970-01-01T${body.endTime}:00`);
        return end > start;
      },
      { message: 'Invalid date format,start time should be before end time' },
    ),
});

const updateOfferedCourseValidationSchema = z.object({
  body: z.object({
    faculty: z.string().optional(),
    maxCapacity: z.number().optional(),
    section: z.number().optional(),
    days: z.enum([...Days] as [string, ...string[]]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const offeredCourseValidations = {
  createOfferedCourseValidationSchema,
  updateOfferedCourseValidationSchema,
};

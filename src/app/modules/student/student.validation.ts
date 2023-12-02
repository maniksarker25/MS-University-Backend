import { z } from 'zod';

const userNameValidationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .refine((value) => /^[A-Z][a-z]*$/.test(value), {
      message:
        'First name must start with an uppercase letter and contain only letters',
    }),
  middleName: z.string().optional(),
  lastName: z
    .string()
    .min(1)
    .refine((value) => /^[A-Za-z]+$/.test(value), {
      message: 'Last name must contain only letters',
    }),
});

// Define a Zod schema for Guardian
const guardianValidationSchema = z.object({
  fatherName: z.string().min(1).trim(),
  fatherOccupation: z.string().min(1),
  fatherContactNo: z.string().min(1),
  motherName: z.string().min(1).trim(),
  motherOccupation: z.string().min(1),
  motherContactNo: z.string().min(1),
});

// Define a Zod schema for LocalGuardian
const localGuardianValidationSchema = z.object({
  name: z.string().min(1),
  occupation: z.string().min(1),
  contactNo: z.string().min(1),
  address: z.string().min(1).trim(),
});

// Define a Zod schema for Student
export const createStudentValidationSchema = z.object({
  body: z.object({
    password: z.string().max(20),
    student: z.object({
      name: userNameValidationSchema,
      gender: z.enum(['male', 'female', 'other']),
      dateOfBirth: z.string().optional(),
      email: z.string().email(),
      contactNo: z.string(),
      emergencyContactNo: z.string(),
      bloodGroup: z
        .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .optional(),
      presentAddress: z.string(),
      permanentAddress: z.string(),
      guardian: guardianValidationSchema,
      localGuardian: localGuardianValidationSchema,
      admissionSemester: z.string(),
      profileImage: z.string().optional(),
    }),
  }),
});
// Create an updateStudentValidationSchema by using all properties
export const updateStudentValidationSchema = z.object({
  body: z.object({
    student: z.object({
      name: userNameValidationSchema.partial().optional(), // Allow partial updates for name
      gender: z.enum(['male', 'female', 'other']).optional(),
      dateOfBirth: z.string().optional(),
      email: z.string().email().optional(),
      contactNo: z.string().optional(),
      emergencyContactNo: z.string().optional(),
      bloodGroup: z
        .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .optional(),
      presentAddress: z.string().optional(),
      permanentAddress: z.string().optional(),
      guardian: guardianValidationSchema.partial().optional(), // Allow partial updates for guardian
      localGuardian: localGuardianValidationSchema.partial().optional(), // Allow partial updates for localGuardian
      admissionSemester: z.string().optional(),
      profileImage: z.string().optional(),
    }),
  }),
});

export const studentValidations = {
  createStudentValidationSchema,
  updateStudentValidationSchema,
};

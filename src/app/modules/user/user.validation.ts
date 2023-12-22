import { z } from 'zod';
import { UserStatus } from './user.constant';
import { string } from 'joi';

const userValidationSchema = z.object({
  password: z
    .string({
      invalid_type_error: 'password must be string',
    })
    .min(1, 'Password must be at least')
    .max(20, 'Password can not be more than 20 characters')
    .optional(),
});

// change status validation schema ----------
const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...UserStatus] as [string, ...string[]]),
  }),
});

export const UserValidations = {
  userValidationSchema,
  changeStatusValidationSchema,
};

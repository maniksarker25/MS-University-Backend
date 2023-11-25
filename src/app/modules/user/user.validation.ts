import { z } from 'zod';

const userValidationSchema = z.object({
  password: z
    .string({
      invalid_type_error: 'password must be string',
    })
    .min(1, 'Password must be at least')
    .max(20, 'Password can not be more than 20 characters')
    .optional(),
});

export default userValidationSchema;

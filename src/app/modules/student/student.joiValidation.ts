import Joi from 'joi';
// creating a schema validation using joi -----------
const studentNameValidationSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .required()
    .max(20)
    .pattern(/^[A-Z][a-z]*$/)
    .message(
      'First name must start with an uppercase letter and contain only letters',
    ),
  middleName: Joi.string().trim().allow('').optional(),
  lastName: Joi.string()
    .required()
    .pattern(/^[A-Za-z]+$/)
    .message('Last name must contain only letters'),
}).required();

const guardianValidationSchema = Joi.object({
  fatherName: Joi.string().required().trim(),
  fatherOccupation: Joi.string().required(),
  fatherContactNo: Joi.string().required(),
  motherName: Joi.string().required().trim(),
  motherOccupation: Joi.string().required(),
  motherContactNo: Joi.string().required(),
}).required();

const localGuardianValidationSchema = Joi.object({
  name: Joi.string().required(),
  occupation: Joi.string().required(),
  contactNo: Joi.string().required(),
  address: Joi.string().required().trim(),
}).required();

// Complete Joi schema for the student model
const studentJoiValidationSchema = Joi.object({
  id: Joi.string().required(),
  name: studentNameValidationSchema,
  gender: Joi.string().valid('male', 'female', 'other').required(),
  dateOfBirth: Joi.string().allow('').optional(),
  email: Joi.string().email().required(),
  contactNo: Joi.string().required(),
  emergencyContactNo: Joi.string().required(),
  bloodGroup: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    .allow('')
    .optional(),
  presentAddress: Joi.string().required(),
  permanentAddress: Joi.string().required(),
  guardian: guardianValidationSchema,
  localGuardian: localGuardianValidationSchema,
  profileImage: Joi.string().allow('').optional(),
  isActive: Joi.string().valid('active', 'blocked').default('active'),
});

export default studentJoiValidationSchema;

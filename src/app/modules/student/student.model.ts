import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import {
  StudentModel,
  TGuardian,
  TLocalGuardian,
  TStudent,
  // StudentModel,
  TUserName,
  // studentMethods,
} from './student.interface';
import config from '../../config';

// schema for username
const userNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    trim: true,
    // build in validation ------------------------
    required: [true, 'First name is required'],
    maxlength: [20, 'First name can not be more then 20 character'],

    // costume validation ------------------------
    validate: {
      validator: function (value: string) {
        const capitalizedString =
          value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        return capitalizedString === value;
      },
      message: '{VALUE} is not in capitalize format',
    },
  },
  middleName: { type: String, trim: true },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    // trim: true,
    // validation with validator package : validator -----------
    validate: {
      validator: (value: string) => validator.isAlpha(value),
      message: '{VALUE} is not valid format',
    },
  },
});

// schema for guardian
const guardianSchema = new Schema<TGuardian>({
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true,
  },
  fatherOccupation: {
    type: String,
    required: [true, 'FatherOccupation  is required'],
  },
  fatherContactNo: {
    type: String,
    required: [true, 'FatherContactNo  is required'],
  },
  motherName: {
    type: String,
    required: [true, 'Mother name is required'],
    trim: true,
  },
  motherOccupation: {
    type: String,
    required: [true, 'Mother Occupation  is required'],
  },
  motherContactNo: {
    type: String,
    required: [true, 'Mother contact number  is required'],
  },
});
// schema for local guardian --------
const localGuardianSchema = new Schema<TLocalGuardian>({
  name: { type: String, required: [true, 'Local guardian name is required'] },
  occupation: {
    type: String,
    required: [true, 'Local guardian occupation  is required'],
  },
  contactNo: {
    type: String,
    required: [true, 'Local guardian contact number  is required'],
  },
  address: {
    type: String,
    required: [true, 'Local guardian address is required'],
    trim: true,
  },
});

// student schema -----------------

// for instance method-------------------------
//const studentSchema = new Schema<TStudent, StudentModel, studentMethods>({
//for static method-------------------------------
const studentSchema = new Schema<TStudent, StudentModel>(
  {
    id: { type: String, required: [true, 'Id is required'], unique: true },
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User id is required'],
      unique: true,
      ref: 'User',
    },
    password: {
      type: String,
      required: true,
      maxlength: [20, 'Password can not be more then 20 character'],
    },
    name: {
      type: userNameSchema,
      required: [true, 'Name is required'],
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message:
          "The gender field can only be one of the following : 'male','female' or 'other'.",
      },
      required: [true, 'Gender is required'],
    },
    dateOfBirth: { type: String },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      // validation with validator package : validator -----------
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: '{VALUE} is not valid email',
      },
    },
    contactNo: { type: String, required: [true, 'Contact number is required'] },
    emergencyContactNo: {
      type: String,
      required: [true, 'Emergency contact number is required'],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE} is not valid data',
      },
    },
    presentAddress: {
      type: String,
      required: [true, 'Present address is required'],
    },
    permanentAddress: {
      type: String,
      required: [true, 'Permanent address  is required'],
    },
    guardian: {
      type: guardianSchema,
      required: [true, 'Guardian  is required'],
    },
    localGuardian: {
      type: localGuardianSchema,
      required: [true, 'Local guardian  is required'],
    },
    profileImage: { type: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  },
);

// mongoose virtual ------------------
studentSchema.virtual('fullName').get(function () {
  return `${this.name.firstName} ${this.name.middleName} ${this.name.lastName}`;
});

// document middleware :  pre save middleware / hook : will work on create() or save() -------------------

studentSchema.pre('save', async function (next) {
  // console.log(this, 'pre hook: we will save the data');
  // hashing password and save into db ---------
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// document middleware : post save middleware / hook : will work on create() or save() ---------------------
studentSchema.post('save', function (doc, next) {
  // doc hossa updated document after save -------
  doc.password = '';
  next();
});

// query middleware : pre find middleware hook ; will work on find()-------------------
studentSchema.pre('find', function (next) {
  // console.log(this);
  this.find({ isDeleted: { $ne: true } });
  next();
});
studentSchema.pre('findOne', function (next) {
  // console.log(this);
  this.find({ isDeleted: { $ne: true } });
  next();
});
studentSchema.pre('aggregate', function (next) {
  // console.log(this);
  // console.log(this.pipeline())
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// ---------creating a costume static method -------------------------

studentSchema.statics.isUserExists = async function (id: string) {
  const existingUser = await Student.findOne({ id });
  return existingUser;
};

// --------------------- creating a costume instance method ------------------
// studentSchema.methods.isUserExists = async function (id: string) {
//   const existingUser = await Student.findOne({ id });
//   return existingUser;
// };

export const Student = model<TStudent, StudentModel>('student', studentSchema);

import { NextFunction, Request, Response } from 'express';
import { UserService } from './user.services';
import sendResponse from '../../utilities/sendResponse';
import httpStatus from 'http-status';

const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { password, student: studentData } = req.body;

    const result = await UserService.createStudentIntoDB(password, studentData);
    // res.status(200).json({
    //   success: true,
    //   message: 'student is created successfully',
    //   data: result,
    // });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Student created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  createStudent,
};

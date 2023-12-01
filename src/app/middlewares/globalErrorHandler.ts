/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = 'Something went wrong';
  return res
    .status(statusCode)
    .json({ success: false, message: err.message || message, error: err });
};

export default globalErrorHandler;

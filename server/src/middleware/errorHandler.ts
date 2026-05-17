import { Request, Response, NextFunction } from 'express';
interface MongooseValidationError extends Error {
  errors: Record<string, { message: string }>;
}

interface ErrorWithStatus extends Error {
  status?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: MongooseValidationError['errors'];
}

export const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction): void => {
  let statusCode = err.status || 500;
  let message = err.message || 'Server Error';
  if (err.code === 11000) { statusCode = 400; const field = Object.keys(err.keyValue || {})[0]; message = `${field} already exists`; }
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  res.status(statusCode).json({ success: false, message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
};

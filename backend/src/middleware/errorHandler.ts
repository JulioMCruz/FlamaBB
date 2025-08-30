import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: (req as any).user
  });

  // mongoose bad object id
  if (err.name === 'CastError') {
    const message = 'resource not found';
    error = { message, statusCode: 404 } as AppError;
  }

  // mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'duplicate field value entered';
    error = { message, statusCode: 400 } as AppError;
  }

  // mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = { message, statusCode: 400 } as AppError;
  }

  // jwt errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'invalid token';
    error = { message, statusCode: 401 } as AppError;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'token expired';
    error = { message, statusCode: 401 } as AppError;
  }

  // zod validation errors
  if (err.name === 'ZodError') {
    const message = 'validation failed';
    error = { message, statusCode: 400 } as AppError;
  }

  // firebase errors
  if (err.name === 'FirebaseError') {
    const message = 'firebase operation failed';
    error = { message, statusCode: 400 } as AppError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

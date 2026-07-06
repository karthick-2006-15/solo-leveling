import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

const parseErrorOrigin = (stack?: string): string => {
  if (!stack) return 'Unknown Origin';
  const lines = stack.split('\n');
  if (lines.length > 1) {
    // Attempt to extract the first line in the stack that relates to our own controllers or services
    const originLine = lines.find(line => line.includes('/controllers/') || line.includes('/services/') || line.includes('/repositories/'));
    if (originLine) {
      return originLine.trim();
    }
    return lines[1].trim(); // Fallback to immediate caller
  }
  return 'Unknown Origin';
};

const getDBStatus = (): string => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
};

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';
  let message = err.message || 'Internal Server Error';

  // Handle specific MongoDB/Mongoose errors safely
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val: any) => val.message);
    message = `Invalid input data. ${messages.join('. ')}`;
    statusCode = 400;
    status = 'fail';
  }
  
  if (err.code === 11000) {
    const valueMatch = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/) : null;
    const value = valueMatch ? valueMatch[0] : 'Duplicate field';
    message = `Duplicate field value: ${value}. Please use another value!`;
    statusCode = 400;
    status = 'fail';
  }

  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}.`;
    statusCode = 400;
    status = 'fail';
  }

  // Check if it's our known AppError
  if (err instanceof AppError || err.isOperational) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  }

  // Gather forensic details
  const errorOrigin = parseErrorOrigin(err.stack);
  const dbStatus = getDBStatus();

  // Always Log the Error Server-Side
  console.error(`\n[API ERROR] 💥 ${req.method} ${req.originalUrl}`);
  console.error(`[DB STATUS] ${dbStatus}`);
  console.error(`[ORIGIN]    ${errorOrigin}`);
  console.error(`[CAUSE]     ${message}`);
  
  if (statusCode === 500) {
    console.error(`[STACK TRACE]`, err.stack);
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      status,
      message,
      error: err,
      stack: err.stack,
      dbStatus,
      errorOrigin
    });
  } else {
    // Production Mode - Secure the response while keeping it meaningful
    if (statusCode !== 500) {
      res.status(statusCode).json({
        success: false,
        status,
        message,
      });
    } else {
      // Unhandled Exceptions - do not leak raw stack traces in prod, but don't just say "Something went very wrong!"
      res.status(500).json({
        success: false,
        status: 'error',
        message: 'The server encountered an unexpected error and could not complete your request. Please try again later.',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  }
};

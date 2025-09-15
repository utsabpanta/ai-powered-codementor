import { Response } from 'express';
import { ApiResponse } from '../types/analysis';

/**
 * Utility functions for standardized API responses
 */

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    data
  } as ApiResponse<T>);
};

export const sendError = (
  res: Response,
  error: string,
  message: string,
  statusCode = 500
): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    message
  } as ApiResponse);
};

export const sendValidationError = (res: Response, message: string): Response => {
  return sendError(res, 'Validation Error', message, 400);
};

export const sendServerError = (res: Response, error: Error): Response => {
  console.error('Server Error:', error);
  return sendError(res, 'Internal Server Error', error.message, 500);
};
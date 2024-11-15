import { Handler, NextFunction, Request, Response } from 'express';
import { ApiError } from './apiError';
import Logging from '../lib/logging';

export const asyncHandler = (handler: Handler) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      next(error);
    }
  };
};

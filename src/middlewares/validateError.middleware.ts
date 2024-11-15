import { validationResult } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

export const validateError = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);

    throw new ApiError(
      'Validation Error',
      400,
      'VALIDATION_ERROR',
      errorMessages,
    );
  }

  next();
});

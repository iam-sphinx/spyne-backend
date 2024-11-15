import { matchedData } from 'express-validator';
import CAR from '../schemas/car.schema';
import USER from '../schemas/user.schema';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/successResponse';
import { Types } from 'mongoose';

export const userCars = asyncHandler(async (req, res, next) => {
  //@ts-ignore
  const id = req.id;
  const { page = 1 } = req.query;

  const limit = 10;
  const skip = (+page - 1) * limit;
  const sortOrder = 1;

  const cars = await CAR.find({ createdBy: id })
    .skip(skip)
    .limit(limit)
    .sort({ [sortOrder]: sortOrder })
    .exec();

  if (cars.length == 0) {
    throw new ApiError('No cars found', 404, 'NO_CARS_FOUND');
  }

  res.status(200).json(successResponse(cars));
});

export const getUserDetails = asyncHandler(async (req, res, next) => {
  //@ts-ignore
  const id = req.id;

  const user = await USER.findById(id).select('-password');
  
  if (!user) {
    throw new ApiError('No user found', 404, 'USER_NOT_FOUND');
  }

  res.status(200).json(successResponse(user));
});

export const isUserExists = asyncHandler(async (req, res, next) => {
  const { email } = matchedData(req);
  const isExist = await USER.findOne({ email });

  res.status(200).json(successResponse({ isExist: !!isExist }));
});

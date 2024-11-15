import { matchedData } from 'express-validator';
import CAR from '../schemas/car.schema';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { successResponse } from '../utils/successResponse';

export const searchCarsByKeywords = asyncHandler(async (req, res, next) => {
  const { q, page = 1 } = req.query;
  //@ts-ignore
  const userId = req.id;

  const limit = 10;
  const skip = (+page - 1) * limit;
  const sortOrder = 1;

  if (!q) {
    throw new ApiError('Search query is required', 400, 'BAD_REQUEST');
  }

  const cars = await CAR.find({
    createdBy: userId,
    $text: { $search: q as string },
  })
    .skip(skip)
    .limit(limit)
    .sort({ [sortOrder]: sortOrder })
    .exec();

  if (!cars) {
    throw new ApiError('No cars found', 404, 'NO_DATA_FOUND');
  }

  res.status(200).json(successResponse(cars));
});

export const getCarDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  //@ts-ignore
  const userId = req.id;

  const car = await CAR.findOne({ createdBy: userId, _id: id });

  if (!car) {
    throw new ApiError('no car data found', 404, 'NO_DATA_FOUND');
  }

  res.status(200).json(successResponse(car));
});

export const createCar = asyncHandler(async (req, res, next) => {
  //@ts-ignore
  const id = req?.id;
  const files = req.files as Express.Multer.File[];

  if (!files || (Array.isArray(files) && files.length === 0)) {
    throw new ApiError('files are required');
  }
  const filePaths = files?.map((file: Express.Multer.File) => file.path);
  const images = await uploadOnCloudinary(filePaths);

  const {
    model,
    company,
    dealer,
    dealerAddress,
    year,
    transmission,
    price,
    currency,
    description,
    tags,
  } = matchedData(req);

  const newCar = new CAR({
    createdBy: id,
    company,
    currency,
    dealer,
    dealerAddress,
    description,
    images,
    model,
    price,
    tags,
    transmission,
    year,
  });

  await newCar.save();

  res.status(200).json(successResponse(newCar));
});

export const deleteCar = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // @ts-ignore
  const userId = req.id;

  const car = CAR.findOne({ _id: id, createdBy: userId });
  if (!car) {
    throw new ApiError(
      'Car does not belong to user or does not exist',
      401,
      'UNAUTHORIZED_REQUEST',
    );
  }

  const deletedCar = await CAR.findByIdAndDelete(id);
  if (!deletedCar) {
    throw new ApiError('Car not found', 404, 'CAR_NOT_FOUND');
  }

  res.status(200).json(successResponse([], 'Car deleted successfully'));
});

export const updateCar = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  //@ts-ignore
  const userId = req.id;

  const {
    tags,
    description,
    title,
    price,
    currency,
    model,
    company,
    dealer,
    dealerAddress,
    year,
    transmission,
  } = matchedData(req);
  const files = req.files as Express.Multer.File[];

  let images = undefined;

  if (files) {
    const paths = files.map((file) => file.path);
    images = await uploadOnCloudinary(paths);
  }

  const car = await CAR.findOne({ _id: id, createdBy: userId });
  if (!car) {
    throw new ApiError(
      'Car does not belong to user or does not exist',
      401,
      'UNAUTHORIZED_REQUEST',
    );
  }

  const updatedCar = await CAR.findByIdAndUpdate(
    id,
    {
      description,
      company,
      model,
      dealer,
      dealerAddress,
      year,
      transmission,
      title,
      price,
      currency,
      $addToSet: { tags, images },
    },
    { new: true },
  );

  if (!updatedCar) {
    throw new ApiError('Failed to update car', 500);
  }

  res.status(200).json(successResponse(updatedCar));
});

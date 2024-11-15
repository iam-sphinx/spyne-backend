import { matchedData } from 'express-validator';
import USER from '../schemas/user.schema';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { successResponse } from '../utils/successResponse';
import admin from '../config/firebaseAdmin.config';

export const signupController = asyncHandler(async (req, res, next) => {
  const { email, password } = matchedData(req);

  // existing user check
  const isExist = await USER.findOne({ email });
  if (isExist) {
    throw new ApiError('user already exist!', 400, 'USER_ALREADY_EXISTS');
  }

  // hashing password of user
  const hashedPassword = await bcrypt.hash(password, 10);

  // save new user
  const newUser = new USER({ email, password: hashedPassword });
  await newUser.save();

  // signin new user
  const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_KEY!, {
    expiresIn: '7d',
  });

  const today = new Date();
  const expires = new Date(today.setDate(today.getDate() + 7));
  res
    .status(200)
    .cookie('access_token', accessToken, { expires })
    .json(successResponse());
});

export const signinController = asyncHandler(async (req, res, next) => {
  const { email, password } = matchedData(req);

  // no user check
  const user = await USER.findOne({ email });

  if (!user) {
    throw new ApiError('user not found', 404, 'USER_NOT_FUND');
  }

  // check user validity
  const { password: savedPassword } = user;
  const isPasswordMatched = await bcrypt.compare(password, savedPassword);
  if (!isPasswordMatched) {
    throw new ApiError('unauthorized request', 401, 'UNAUTHORIZED');
  }

  // user is valid so signin
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_KEY!, {
    expiresIn: '7d',
  });

  const today = new Date();
  const expires = new Date(today.setDate(today.getDate() + 7));
  res
    .status(200)
    .cookie('access_token', accessToken, { expires })
    .json(successResponse());
});

export const googleController = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new ApiError('token not found', 400, 'TOKEN_NOT_FOUND');
  }
  const token = authorization.split(' ')?.[1];

  const { email, picture: profileImg } = await admin
    .auth()
    .verifyIdToken(token);

  // this one will update if exist and if not will create one
  const user = await USER.findOneAndUpdate(
    { email },
    { $set: { email, isVerified: true, profileImg } },
    { upsert: true, new: true },
  );

  // create a auth token
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_KEY!, {
    expiresIn: '7d',
  });

  const today = new Date();
  const expires = new Date(today.setDate(today.getDate() + 7));
  res
    .status(200)
    .cookie('access_token', accessToken, { expires })
    .json(successResponse());
});

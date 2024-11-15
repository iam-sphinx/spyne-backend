import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  const access_token = req.cookies?.access_token;

  const token = authorization || access_token;

  if (!token) {
    throw new ApiError('unauthorized request', 401, 'UNAUTHORIZED_REQUEST');
  }

  const data = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;

  //@ts-ignore
  req.id = data?.userId;
  next();
});

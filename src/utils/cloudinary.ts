import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ApiError } from './apiError';
import Logging from '../lib/logging';

export const uploadOnCloudinary = async (
  files: string[],
): Promise<string[]> => {
  try {
    // Cloudinary config
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const results: string[] = [];

    for (const file of files) {
      try {
        const response = await cloudinary.uploader.upload(file);
        results.push(response.url);
      } catch (err) {
        // Handle individual file upload errors
        Logging.error(err);
        throw new ApiError(
          'Failed to upload file on cloudinary',
          500,
          'CLOUDINARY_UPLOAD_FAILED',
        );
      }
    }

    return results;
  } catch (error) {
    Logging.error(error);
    files.forEach((file) => {
      try {
        fs.unlinkSync(file);
      } catch (err) {
        Logging.error(err);
      }
    });
    throw new ApiError(
      'Failed to upload on cloudinary',
      500,
      'CLOUDINARY_UPLOAD_FAILED',
    );
  } finally {
    files.forEach((file) => {
      try {
        fs.unlinkSync(file);
      } catch (err) {
        Logging.error(err);
      }
    });
  }
};

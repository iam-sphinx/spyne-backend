import mongoose from 'mongoose';
import Logging from '../lib/logging';

export const connectDB = async () => {
  try {
    const url = process.env.MONGO_URI;
    if (!url) {
      throw new Error('mongo db url not found');
    }
    const dbInfo = await mongoose.connect(url);
    Logging.info(`mongodb connected at host : ${dbInfo.connection.host}`);
  } catch (error) {
    Logging.error(error);
    process.exit(1);
  }
};

import { config } from 'dotenv';
import cors from 'cors';

config();

import express, { NextFunction, Request, Response } from 'express';
import { connectDB } from './db/connectDB';
import Logging from './lib/logging';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { options } from './config/swagger.config';
import cookieParser from 'cookie-parser';
import fs from 'fs';

// Routes import
import authRoutes from './routes/auth.routes';
import carRoutes from './routes/car.routes';
import userRoutes from './routes/user.routes';

const app = express();
const swaggerSpec = swaggerJsDoc(options);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URI!],
  }),
);
app.use(cookieParser());

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cars', carRoutes);

// health routs
app.get('/health', (req, res, next) => {
  res.status(200).json('spyne server is healthy');
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  Logging.error(err);
  const files = req.files as Express.Multer.File[];
  if (files) {
    files?.forEach((file) => fs.unlinkSync(file.path));
  }
  const statusCode = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message;
  const response = {
    status: 'error',
    statusCode,
    message,
  };
  res.status(statusCode).json(response);
});

// swagger ui for documentation
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const port = process.env.PORT;
connectDB().then(() => {
  app.listen(port, () => {
    Logging.info(`sever is starting at port : ${port}`);
  });
});

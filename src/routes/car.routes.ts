import { Router } from 'express';
import {
  createCar,
  deleteCar,
  getCarDetails,
  searchCarsByKeywords,
  updateCar,
} from '../controllers/car.controller';
import { body, param, query } from 'express-validator';
import { validateError } from '../middlewares/validateError.middleware';
import mongoose from 'mongoose';
import { verifyJWT } from '../middlewares/verifyJWT.middleware';
import { upload } from '../middlewares/multer.middleware';

const router = Router();

const queryValidations = [
  param('id')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(
          'Invalid ID format. It must be a 24 character hex string.',
        );
      }
      return true;
    })
    .escape(),
];

const keywordQueryValdiations = [
  query('q')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('query key is required.')
    .escape(),
  query('page')
    .optional()
    .customSanitizer((value) => (value ? parseInt(value) : 1)),
];

const creatCarValidations = [
  // 'model' should be a string and required
  body('model')
    .isString()
    .withMessage('Model must be a string')
    .notEmpty()
    .withMessage('Model is required'),

  // 'company' should be a string and required
  body('company')
    .isString()
    .withMessage('Company must be a string')
    .notEmpty()
    .withMessage('Company is required'),

  // 'dealer' should be a string and required
  body('dealer')
    .isString()
    .withMessage('Dealer must be a string')
    .notEmpty()
    .withMessage('Dealer is required'),

  // 'dealerAddress' should be a string and required
  body('dealerAddress')
    .isString()
    .withMessage('Dealer address must be a string')
    .notEmpty()
    .withMessage('Dealer address is required'),

  // 'year' should be a valid date and required
  body('year').isString().trim().notEmpty().withMessage('Year is required'),

  // 'transmission' should be either 'manual' or 'automatic' and required
  body('transmission')
    .isIn(['manual', 'automatic'])
    .withMessage('Transmission must be either "manual" or "automatic"')
    .notEmpty()
    .withMessage('Transmission is required'),

  // 'price' should be a number and required
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .notEmpty()
    .withMessage('Price is required'),

  // 'currency' should be a string and required
  body('currency')
    .isString()
    .withMessage('Currency must be a string')
    .notEmpty()
    .withMessage('Currency is required'),

  // 'description' can be a string but not required
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  // 'tags' should be an array of strings (optional) and each tag must be a string
  body('tags')
    .optional()
    .customSanitizer((value) => {
      // Convert comma-separated string to an array
      if (typeof value === 'string') {
        return value.split(',').map((tag) => tag.trim());
      }
      return value;
    })
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      // Ensure each tag is a string
      if (Array.isArray(value)) {
        value.forEach((tag) => {
          if (typeof tag !== 'string') {
            throw new Error('Each tag must be a string');
          }
        });
      }
      return true;
    }),
];

const updateCarValidations = [
  // 'model' should be a string, but it's optional
  body('model').optional().isString().withMessage('Model must be a string'),

  // 'company' should be a string, but it's optional
  body('company').optional().isString().withMessage('Company must be a string'),

  // 'dealer' should be a string, but it's optional
  body('dealer').optional().isString().withMessage('Dealer must be a string'),

  // 'dealerAddress' should be a string, but it's optional
  body('dealerAddress')
    .optional()
    .isString()
    .withMessage('Dealer address must be a string'),

  // 'year' should be a valid string, but it's optional
  body('year').optional().isString().withMessage('Year must be a string'),

  // 'transmission' should be either 'manual' or 'automatic', but it's optional
  body('transmission')
    .optional()
    .isIn(['manual', 'automatic'])
    .withMessage('Transmission must be either "manual" or "automatic"'),

  // 'price' should be a number, but it's optional
  body('price').optional().isNumeric().withMessage('Price must be a number'),

  // 'currency' should be a string, but it's optional
  body('currency')
    .optional()
    .isString()
    .withMessage('Currency must be a string'),

  // 'description' can be a string but not required
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  // 'tags' should be an array of strings (optional) and each tag must be a string
  body('tags')
    .optional()
    .customSanitizer((value) => {
      // Convert comma-separated string to an array if necessary
      if (typeof value === 'string') {
        return value.split(',').map((tag) => tag.trim());
      }
      return value;
    })
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      // Ensure each tag is a string
      if (Array.isArray(value)) {
        value.forEach((tag) => {
          if (typeof tag !== 'string') {
            throw new Error('Each tag must be a string');
          }
        });
      }
      return true;
    }),
];

// Routes

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get car details by ID
 *     description: Retrieve the details of a car by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the car.
 *         schema:
 *           type: string
 *           pattern: "^[a-fA-F0-9]{24}$" # Ensure it is a valid ObjectId
 *     security:
 *       - BearerAuth: []  # This route requires JWT token
 *     responses:
 *       200:
 *         description: Successfully retrieved car details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The car's unique ID
 *                 model:
 *                   type: string
 *                   description: The model of the car
 *                 company:
 *                   type: string
 *                   description: The company that manufactures the car
 *                 dealer:
 *                   type: string
 *                   description: The dealer selling the car
 *                 dealerAddress:
 *                   type: string
 *                   description: The address of the dealer
 *                 year:
 *                   type: string
 *                   description: The manufacturing year of the car
 *                 transmission:
 *                   type: string
 *                   enum: [manual, automatic]
 *                   description: The type of transmission of the car
 *                 price:
 *                   type: number
 *                   format: float
 *                   description: The price of the car
 *                 currency:
 *                   type: string
 *                   description: The currency of the price
 *                 description:
 *                   type: string
 *                   description: A detailed description of the car
 *       400:
 *         description: Invalid car ID format
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       404:
 *         description: Car not found with the provided ID
 */

router
  .route('/:id')
  .get(queryValidations, validateError, verifyJWT, getCarDetails);

/**
 * @swagger
 * /cars/create:
 *   post:
 *     summary: Create a new car
 *     description: Create a new car listing with all required details.
 *     security:
 *       - BearerAuth: []  # This route requires JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model
 *               - company
 *               - dealer
 *               - dealerAddress
 *               - year
 *               - transmission
 *               - price
 *               - currency
 *             properties:
 *               model:
 *                 type: string
 *                 description: The model of the car
 *               company:
 *                 type: string
 *                 description: The company that manufactures the car
 *               dealer:
 *                 type: string
 *                 description: The dealer selling the car
 *               dealerAddress:
 *                 type: string
 *                 description: The address of the dealer
 *               year:
 *                 type: string
 *                 description: The manufacturing year of the car
 *               transmission:
 *                 type: string
 *                 enum: [manual, automatic]
 *                 description: The type of transmission of the car
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The price of the car
 *               currency:
 *                 type: string
 *                 description: The currency of the price
 *               description:
 *                 type: string
 *                 description: A detailed description of the car (optional)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags associated with the car (optional)
 *     responses:
 *       201:
 *         description: Successfully created the car
 *       400:
 *         description: Invalid input, missing or incorrect required fields
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 */

router
  .route('/create')
  .post(
    verifyJWT,
    upload.array('images', 10),
    creatCarValidations,
    validateError,
    createCar,
  );

/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     summary: Delete a car by ID
 *     description: Delete a car listing by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the car to be deleted.
 *         schema:
 *           type: string
 *           pattern: "^[a-fA-F0-9]{24}$"  # Ensure it is a valid ObjectId
 *     security:
 *       - BearerAuth: []  # This route requires JWT token
 *     responses:
 *       200:
 *         description: Car successfully deleted
 *       400:
 *         description: Invalid car ID format
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       404:
 *         description: Car not found with the provided ID
 */

router
  .route('/:id')
  .delete(queryValidations, validateError, verifyJWT, deleteCar);

  /**
 * @swagger
 * /cars/{id}:
 *   put:
 *     summary: Update car details by ID
 *     description: Update details of a car by its unique ID. Only the fields to be updated need to be included in the request body.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the car to be updated.
 *         schema:
 *           type: string
 *           pattern: "^[a-fA-F0-9]{24}$"  # Ensure it is a valid ObjectId
 *     security:
 *       - BearerAuth: []  # This route requires JWT token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 description: The model of the car
 *               company:
 *                 type: string
 *                 description: The company that manufactures the car
 *               dealer:
 *                 type: string
 *                 description: The dealer selling the car
 *               dealerAddress:
 *                 type: string
 *                 description: The address of the dealer
 *               year:
 *                 type: string
 *                 description: The manufacturing year of the car
 *               transmission:
 *                 type: string
 *                 enum: [manual, automatic]
 *                 description: The type of transmission of the car
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The price of the car
 *               currency:
 *                 type: string
 *                 description: The currency of the price
 *               description:
 *                 type: string
 *                 description: A detailed description of the car (optional)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags associated with the car (optional)
 *     responses:
 *       200:
 *         description: Successfully updated car details
 *       400:
 *         description: Invalid car ID format or invalid input
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       404:
 *         description: Car not found with the provided ID
 */

router
  .route('/:id')
  .put(
    verifyJWT,
    upload.array('images', 1),
    updateCarValidations,
    validateError,
    updateCar,
  );

  /**
 * @swagger
 * /cars/query/search:
 *   get:
 *     summary: Search cars by keywords
 *     description: Search cars by keywords and pagination.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Keywords to search for in car listings.
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination (default is 1).
 *         schema:
 *           type: integer
 *           default: 1
 *     security:
 *       - BearerAuth: []  # This route requires JWT token
 *     responses:
 *       200:
 *         description:
 */
router
  .route('/query/search')
  .get(verifyJWT, keywordQueryValdiations, validateError, searchCarsByKeywords);

export default router;

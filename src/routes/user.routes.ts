import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getUserDetails,
  isUserExists,
  userCars,
} from '../controllers/user.controller';
import { validateError } from '../middlewares/validateError.middleware';
import { verifyJWT } from '../middlewares/verifyJWT.middleware';

const router = Router();

const queryValidations = [
  query('page')
    .optional()
    .customSanitizer((value) => (value ? parseInt(value) : 1)),
];

// Routes
/**
 * @swagger
 * /users/cars:
 *   get:
 *     summary: Get cars listed by the authenticated user
 *     description: Retrieve the cars listed by the authenticated user with pagination.
 *     parameters:
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
 *         description: Successfully retrieved cars listed by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique ID of the car
 *                   model:
 *                     type: string
 *                     description: The model of the car
 *                   company:
 *                     type: string
 *                     description: The company that manufactures the car
 *                   dealer:
 *                     type: string
 *                     description: The dealer selling the car
 *                   dealerAddress:
 *                     type: string
 *                     description: The address of the dealer
 *                   year:
 *                     type: string
 *                     description: The manufacturing year of the car
 *                   transmission:
 *                     type: string
 *                     enum: [manual, automatic]
 *                     description: The type of transmission of the car
 *                   price:
 *                     type: number
 *                     format: float
 *                     description: The price of the car
 *                   currency:
 *                     type: string
 *                     description: The currency of the price
 *       404:
 *         description: No cars found for the user
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 */

router.route('/cars').get(queryValidations, validateError, verifyJWT, userCars);


/**
 * @swagger
 * /users/info:
 *   get:
 *     summary: Get details of the authenticated user
 *     description: Retrieve details of the authenticated user excluding the password field.
 *     security:
 *       - BearerAuth: []  # This route requires JWT token
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique ID of the user
 *                 email:
 *                   type: string
 *                   description: The email of the user
 *                 name:
 *                   type: string
 *                   description: The name of the user
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date when the user was created
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 */

router.route('/info').get(verifyJWT, getUserDetails);

/**
 * @swagger
 * /users/is-exists:
 *   post:
 *     summary: Check if a user exists by email
 *     description: Check if a user exists in the system using the provided email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user to check
 *     responses:
 *       200:
 *         description: Successfully checked if the user exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isExist:
 *                   type: boolean
 *                   description: Whether the user with the provided email exists
 *       400:
 *         description: Invalid email format
 */
router
  .route('/is-exists')
  .post(
    body('email').isEmail().withMessage('Invalid email format').escape(),
    validateError,
    isUserExists,
  );
export default router;

import { Router } from 'express';
import {
  googleController,
  signinController,
  signupController,
} from '../controllers/auth.controller';
import { body, header } from 'express-validator';
import { validateError } from '../middlewares/validateError.middleware';

const router = Router();

// CUSTOM VALIDATIONS
const authValidations = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const googleValidations = [
  header('authorization')
    .exists()
    .withMessage('Authorization header is required')
    .matches(/^Bearer\s([A-Za-z0-9\-._~+/=]+)$/)
    .withMessage('Authorization header must be a Bearer token'),
];

// ROUTES

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     description: Register a new user by providing an email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: User successfully created and logged in
 *       400:
 *         description: User already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User already exists"
 *       500:
 *         description: Internal Server Error
 */
router.route('/signup').post(authValidations, validateError, signupController);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Sign in a user
 *     description: Sign in an existing user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized request (incorrect password)
 *       500:
 *         description: Internal Server Error
 */
router.route('/signin').post(authValidations, validateError, signinController);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Sign in with Google
 *     description: Sign in or register a user using Google OAuth2 token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authorization:
 *                 type: string
 *                 description: Bearer token from Google OAuth2
 *                 example: "Bearer YOUR_GOOGLE_ID_TOKEN"
 *     responses:
 *       200:
 *         description: User successfully logged in or created
 *       400:
 *         description: Invalid or missing token
 *       500:
 *         description: Internal Server Error
 */
router
  .route('/google')
  .post(googleValidations, validateError, googleController);

export default router;

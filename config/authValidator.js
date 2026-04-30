const { body } = require('express-validator');
const User = require('../../models/userModel');

exports.signupRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email.')
    .normalizeEmail()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        return Promise.reject('E-mail already in use');
      }
    }),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),

  body('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
];

exports.loginRules = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password cannot be empty.'),
];
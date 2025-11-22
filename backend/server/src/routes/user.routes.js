const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../auth/checkAuth');
const { authUser } = require('../middleware/authUser');
const usersController = require('../controllers/user.controller');

// Auth Routes
router.post('/register', asyncHandler(usersController.register));
router.post('/login', asyncHandler(usersController.login));
router.get('/auth', authUser, asyncHandler(usersController.authUser));
router.get('/logout', authUser, asyncHandler(usersController.logout));
router.post('/forgot-password', asyncHandler(usersController.forgotPassword));
router.post('/verify-forgot-password', asyncHandler(usersController.verifyForgotPassword));

// Address Routes (MỚI)
router.post('/address', authUser, asyncHandler(usersController.addAddress));
router.delete('/address/:addressId', authUser, asyncHandler(usersController.deleteAddress));
router.patch('/address/set-default', authUser, asyncHandler(usersController.setDefaultAddress));

module.exports = router;
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../auth/checkAuth');
const { authUser } = require('../middleware/authUser');
const reviewController = require('../controllers/review.controller');

router.post('/create', authUser, asyncHandler(reviewController.createReview));
router.get('/product/:productId', asyncHandler(reviewController.getReviewsByProduct)); // Public ai cũng xem được

module.exports = router;
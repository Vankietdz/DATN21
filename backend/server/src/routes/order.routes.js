const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../auth/checkAuth');
const { authUser } = require('../middleware/authUser');
const orderController = require('../controllers/order.controller');

router.post('/checkout', authUser, asyncHandler(orderController.checkout));
router.get('/my-orders', authUser, asyncHandler(orderController.getMyOrders));
router.get('/detail/:orderId', authUser, asyncHandler(orderController.getOrderDetail));

// Callback không cần authUser vì do Server VNPay gọi
router.get('/vnpay-callback', asyncHandler(orderController.vnpayCallback));

module.exports = router;
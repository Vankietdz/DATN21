const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../auth/checkAuth');
const { authAdmin, authUser } = require('../middleware/authUser');

const couponController = require('../controllers/coupon.controller');

// --- Admin Routes ---
router.post('/create', authAdmin, asyncHandler(couponController.createCoupon));
router.get('/list', authAdmin, asyncHandler(couponController.getAllCoupon));
// router.put('/update/:id', authAdmin, asyncHandler(couponController.updateCoupon)); // Bạn có thể thêm nếu cần
// router.delete('/delete/:id', authAdmin, asyncHandler(couponController.deleteCoupon)); // Bạn có thể thêm nếu cần

// --- User Routes ---
// API này dùng để check xem mã có hợp lệ không và giảm bao nhiêu tiền trước khi đặt hàng
router.post('/apply', authUser, asyncHandler(couponController.applyCoupon));

module.exports = router;
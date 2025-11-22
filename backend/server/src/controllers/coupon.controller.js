const couponModel = require('../models/coupon.model');
const { Created, OK } = require('../core/success.response');
const { NotFoundError, BadRequestError } = require('../core/error.response');

class CouponController {
    
    // Tạo Coupon mới
    async createCoupon(req, res) {
        const { code, name, type, value, startDate, endDate, minOrderValue, usageLimit } = req.body;
        
        if (!code || !name || !value || !startDate || !endDate) {
            throw new BadRequestError('Thiếu thông tin bắt buộc');
        }

        // Check trùng code
        const existCoupon = await couponModel.findOne({ code: code.toUpperCase() });
        if (existCoupon) throw new BadRequestError('Mã giảm giá này đã tồn tại');

        const newCoupon = await couponModel.create({
            code: code.toUpperCase(),
            name,
            type, // 'PERCENTAGE' hoặc 'FIXED_AMOUNT'
            value,
            startDate,
            endDate,
            minOrderValue: minOrderValue || 0,
            usageLimit: usageLimit || 100
        });

        return new Created({
            message: 'Tạo mã giảm giá thành công',
            metadata: newCoupon,
        }).send(res);
    }

    // Admin lấy danh sách
    async getAllCoupon(req, res) {
        const coupons = await couponModel.find().sort({ createdAt: -1 });
        return new OK({
            message: 'Lấy danh sách mã giảm giá thành công',
            metadata: coupons,
        }).send(res);
    }

    // User check mã giảm giá (Tính toán số tiền được giảm)
    async applyCoupon(req, res) {
        const { code, orderTotal } = req.body; // orderTotal: Tổng tiền đơn hàng hiện tại

        const coupon = await couponModel.findOne({ 
            code: code.toUpperCase(), 
            isActive: true 
        });

        if (!coupon) throw new NotFoundError('Mã giảm giá không tồn tại hoặc đã bị khóa');

        // 1. Validate thời hạn
        const now = new Date();
        if (now < new Date(coupon.startDate)) throw new BadRequestError('Mã giảm giá chưa bắt đầu');
        if (now > new Date(coupon.endDate)) throw new BadRequestError('Mã giảm giá đã hết hạn');

        // 2. Validate số lượng
        if (coupon.usedCount >= coupon.usageLimit) throw new BadRequestError('Mã giảm giá đã hết lượt sử dụng');

        // 3. Validate giá trị đơn tối thiểu
        if (orderTotal < coupon.minOrderValue) {
            throw new BadRequestError(`Đơn hàng phải tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này`);
        }

        // 4. Tính toán số tiền giảm
        let discountAmount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discountAmount = (orderTotal * coupon.value) / 100;
            // Có thể thêm logic maxDiscount (Giảm tối đa bao nhiêu) nếu cần
        } else {
            discountAmount = coupon.value; // Giảm thẳng tiền mặt (VD: 50k)
        }

        // Đảm bảo không giảm quá giá trị đơn hàng
        if (discountAmount > orderTotal) discountAmount = orderTotal;

        return new OK({
            message: 'Áp dụng mã thành công',
            metadata: {
                couponId: coupon._id,
                code: coupon.code,
                discountAmount: discountAmount,
                finalPrice: orderTotal - discountAmount
            }
        }).send(res);
    }
}

module.exports = new CouponController();
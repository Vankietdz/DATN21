const reviewModel = require('../models/review.model');
const orderModel = require('../models/order.model'); // Nhớ đổi tên paymentModel thành orderModel
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');

class ReviewController {
    async createReview(req, res) {
        const userId = req.user;
        const { productId, orderId, rating, comment } = req.body;
        // Xử lý ảnh feedback từ req.files tương tự ProductController (nếu có)

        // 1. Kiểm tra xem user đã mua sản phẩm này trong đơn hàng đó chưa
        const order = await orderModel.findOne({
            _id: orderId,
            userId: userId,
            status: 'delivered', // Chỉ cho đánh giá khi đã giao hàng thành công
            'products.productId': productId
        });

        if (!order) {
            throw new BadRequestError('Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn tất');
        }

        // 2. Kiểm tra xem đã đánh giá chưa (tránh spam)
        const existReview = await reviewModel.findOne({ userId, productId, orderId });
        if (existReview) {
            throw new BadRequestError('Bạn đã đánh giá sản phẩm này rồi');
        }

        const newReview = await reviewModel.create({
            userId, productId, orderId, rating, comment
        });

        return new Created({
            message: 'Đánh giá thành công',
            metadata: newReview
        }).send(res);
    }

    async getReviewsByProduct(req, res) {
        const { productId } = req.params;
        const reviews = await reviewModel.find({ productId, isHidden: false })
                                         .populate('userId', 'fullName avatar') // Lấy tên và avatar người đánh giá
                                         .sort({ createdAt: -1 });
        
        return new OK({
            message: 'Lấy danh sách đánh giá thành công',
            metadata: reviews
        }).send(res);
    }
}

module.exports = new ReviewController();
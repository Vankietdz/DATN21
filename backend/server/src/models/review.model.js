const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Ràng buộc: Phải mua rồi mới được đánh giá
        
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '' },
        images: { type: Array, default: [] }, // Ảnh feedback thực tế
        
        isHidden: { type: Boolean, default: false } // Admin có thể ẩn đánh giá spam
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Review', reviewSchema);
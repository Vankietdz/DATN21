const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema con cho địa chỉ
const addressSchema = new Schema({
    name: { type: String, required: true }, // VD: Nhà riêng, Văn phòng
    recipientName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    fullAddress: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const userModel = new Schema(
    {
        fullName: { type: String, minlength: 2, required: true },
        email: { type: String, minlength: 6, required: true, unique: true },
        password: { type: String, minlength: 6, required: true },
        
        avatar: { type: String, default: '' }, // Thêm Avatar
        
        isAdmin: { type: Boolean, default: false }, // Giữ nguyên logic cũ của bạn
        
        // Thêm mảng địa chỉ
        addresses: [addressSchema],
        
        status: { type: String, default: 'active' } // active/blocked
    },
    {
        timestamps: true,
    },
);
module.exports = mongoose.model('User', userModel);
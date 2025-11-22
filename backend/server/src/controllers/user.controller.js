const { ConflictRequestError, NotFoundError, AuthFailureError, BadRequestError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const otpModel = require('../models/otp.model');
const { createAccessToken, createRefreshToken } = require('../auth/checkAuth');
const SendMailForgotPassword = require('../utils/mailForgotPassword');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');

function setCookie(res, accessToken, refreshToken) {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
    });
    res.cookie('logged', 1, {
        httpOnly: false,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
    });
}

class UsersController {
    // ... (Giữ nguyên register, login, authUser, logout, forgotPassword...)
    async register(req, res) {
        const { email, password } = req.body;
        const fullName = req.body.fullName || req.body.fullname;
        if (!fullName) throw new BadRequestError('Vui lòng cung cấp họ tên');
        
        const findUser = await userModel.findOne({ email });
        if (findUser) throw new ConflictRequestError('Email đã tồn tại');
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await userModel.create({
            fullName,
            email,
            password: hashedPassword,
        });

        return new Created({ message: 'Đăng ký thành công', metadata: newUser }).send(res);
    }

    async login(req, res) {
        const { email, password } = req.body;
        const findUser = await userModel.findOne({ email });
        if (!findUser) throw new NotFoundError('Tài khoản hoặc mật khẩu không chính xác !');

        const isMathPassword = await bcrypt.compare(password, findUser.password);
        if (!isMathPassword) throw new AuthFailureError('Tài khoản hoặc mật khẩu không chính xác !');

        const accessToken = createAccessToken({ id: findUser._id });
        const refreshToken = createRefreshToken({ id: findUser._id });
        setCookie(res, accessToken, refreshToken);

        return new OK({
            message: 'Đăng nhập thành công',
            metadata: { accessToken, refreshToken },
        }).send(res);
    }

    async authUser(req, res) {
        const userId = req.user;
        if (!userId) throw new AuthFailureError('Vui lòng đăng nhập lại');
        const findUser = await userModel.findById(userId);
        if (!findUser) throw new NotFoundError('Người dùng không tồn tại');

        return new OK({ message: 'Xác thực thành công', metadata: findUser }).send(res);
    }

    async logout(req, res) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.clearCookie('logged');
        return new OK({ message: 'Đăng xuất thành công', metadata: {} }).send(res);
    }

    async forgotPassword(req, res) {
        const { email } = req.body;
        const findUser = await userModel.findOne({ email });
        if (!findUser) throw new NotFoundError('Email không tồn tại');

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        const tokenForgotPassword = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '5m' });
        res.cookie('tokenForgotPassword', tokenForgotPassword, { httpOnly: false, secure: true, maxAge: 5 * 60 * 1000, sameSite: 'strict' });

        await otpModel.create({ otp, email });
        await SendMailForgotPassword(email, otp);

        return new OK({ message: 'Mã OTP đã được gửi đến email của bạn', metadata: true }).send(res);
    }

    async verifyForgotPassword(req, res) {
        const { otp, password } = req.body;
        const tokenForgotPassword = req.cookies.tokenForgotPassword;
        if (!tokenForgotPassword || !otp) throw new BadRequestError('Bạn đang thiếu thông tin');
        
        let decoded;
        try {
            decoded = jwt.verify(tokenForgotPassword, process.env.JWT_SECRET);
        } catch(e) {
            throw new BadRequestError('Phiên làm việc hết hạn, vui lòng thử lại');
        }

        const email = decoded.email;
        const findOtp = await otpModel.findOne({ email, otp });
        if (!findOtp) throw new BadRequestError('Mã OTP không hợp lệ');

        const findUser = await userModel.findOne({ email });
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        findUser.password = hashedPassword;
        await findUser.save();

        await otpModel.deleteMany({ email });
        res.clearCookie('tokenForgotPassword');

        return new OK({ message: 'Khôi phục mật khẩu thành công', metadata: true }).send(res);
    }

    // --- CÁC HÀM MỚI: QUẢN LÝ ĐỊA CHỈ ---

    async addAddress(req, res) {
        const userId = req.user;
        const { name, recipientName, phoneNumber, fullAddress, isDefault } = req.body;

        if (!name || !recipientName || !phoneNumber || !fullAddress) {
            throw new BadRequestError('Thiếu thông tin địa chỉ');
        }

        const user = await userModel.findById(userId);
        if (!user) throw new NotFoundError('User không tồn tại');

        // Nếu là địa chỉ mặc định, bỏ mặc định các địa chỉ cũ
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        } else if (user.addresses.length === 0) {
            // Nếu là địa chỉ đầu tiên, tự động set mặc định
            isDefault = true;
        }

        user.addresses.push({ name, recipientName, phoneNumber, fullAddress, isDefault });
        await user.save();

        return new OK({
            message: 'Thêm địa chỉ thành công',
            metadata: user.addresses
        }).send(res);
    }

    async deleteAddress(req, res) {
        const userId = req.user;
        const { addressId } = req.params;

        const user = await userModel.findById(userId);
        
        // Lọc bỏ địa chỉ cần xóa
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
        await user.save();

        return new OK({
            message: 'Xóa địa chỉ thành công',
            metadata: user.addresses
        }).send(res);
    }

    async setDefaultAddress(req, res) {
        const userId = req.user;
        const { addressId } = req.body;

        const user = await userModel.findById(userId);
        
        user.addresses.forEach(addr => {
            if (addr._id.toString() === addressId) {
                addr.isDefault = true;
            } else {
                addr.isDefault = false;
            }
        });
        await user.save();

        return new OK({
            message: 'Đặt địa chỉ mặc định thành công',
            metadata: user.addresses
        }).send(res);
    }
}

module.exports = new UsersController();
const orderModel = require('../models/order.model');
const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');
const couponModel = require('../models/coupon.model');
const { NotFoundError, BadRequestError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');
const NotificationController = require('./notification.controller');

// Import thư viện thanh toán
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const crypto = require('crypto');
const https = require('https');

// Hàm generate mã đơn hàng
const generateOrderCode = () => {
    return '#DH' + Date.now().toString().slice(-8);
};

class OrderController {

    // 1. TẠO ĐƠN HÀNG (CHECKOUT)
    async checkout(req, res) {
        const userId = req.user;
        const { paymentMethod, shippingAddress } = req.body;

        // a. Lấy giỏ hàng
        const findCart = await cartModel.findOne({ userId });
        if (!findCart || findCart.products.length === 0) {
            throw new BadRequestError('Giỏ hàng trống');
        }

        // b. Kiểm tra tồn kho
        for (const item of findCart.products) {
            const product = await productModel.findById(item.productId);
            if (!product || product.stockProduct < item.quantity) {
                throw new BadRequestError(`Sản phẩm ${product ? product.nameProduct : ''} không đủ số lượng`);
            }
        }

        // c. Tạo Snapshot sản phẩm
        const productDetails = await Promise.all(findCart.products.map(async (p) => {
            const prod = await productModel.findById(p.productId);
            return {
                productId: p.productId,
                nameProduct: prod.nameProduct,
                imageProduct: prod.imagesProduct[0],
                price: prod.priceProduct * (1 - prod.discountProduct / 100),
                quantity: p.quantity
            };
        }));

        // d. Tạo Đơn hàng mới
        const newOrder = await orderModel.create({
            userId,
            orderCode: generateOrderCode(),
            products: productDetails,
            totalPrice: findCart.totalPrice,
            finalPrice: findCart.finalPrice || findCart.totalPrice,
            couponId: findCart.couponId,
            shippingAddress: shippingAddress,
            paymentMethod,
            status: 'pending',
            isPaid: false
        });

        // e. Xử lý kho & giỏ hàng
        for (const item of findCart.products) {
            await productModel.findByIdAndUpdate(item.productId, {
                $inc: { stockProduct: -item.quantity }
            });
        }
        if (findCart.couponId) {
            await couponModel.findByIdAndUpdate(findCart.couponId, { $inc: { quantity: -1 } });
        }
        await cartModel.findOneAndDelete({ userId });
        await cartModel.create({ userId, products: [] });

        // f. Điều hướng thanh toán & Thông báo

        // --- CASE 1: COD ---
        if (paymentMethod === 'cod') {
            // Bắn thông báo
            await NotificationController.pushNoti({
                userId,
                title: 'Đặt hàng thành công',
                message: `Đơn hàng ${newOrder.orderCode} đã được ghi nhận. Vui lòng chú ý điện thoại khi shipper gọi.`,
                type: 'ORDER',
                metadata: { orderId: newOrder._id }
            });

            return new Created({
                message: 'Đặt hàng thành công',
                metadata: newOrder
            }).send(res);
        }

        // --- CASE 2: VNPAY ---
        else if (paymentMethod === 'vnpay') {
            const vnpay = new VNPay({
                tmnCode: 'KG23Q6G0',
                secureSecret: 'KG5RSDIX9PJ3RRBKGUQB9BB70LTIKO9A',
                vnpayHost: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
                testMode: true,
                hashAlgorithm: 'SHA512'
            });

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const paymentUrl = vnpay.buildPaymentUrl({
                vnp_Amount: newOrder.finalPrice,
                vnp_IpAddr: '127.0.0.1',
                vnp_TxnRef: newOrder._id.toString(),
                vnp_OrderInfo: `Thanh toan don hang ${newOrder.orderCode}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:8000/api/order/vnpay-callback`,
                vnp_Locale: VnpLocale.VN,
                vnp_CreateDate: dateFormat(new Date()),
                vnp_ExpireDate: dateFormat(tomorrow),
            });

            return new Created({
                message: 'Vui lòng thanh toán qua VNPay',
                metadata: { order: newOrder, paymentUrl }
            }).send(res);
        }

        // --- CASE 3: MOMO ---
        else if (paymentMethod === 'momo') {
            const partnerCode = 'MOMO';
            const accessKey = 'F8BBA842ECF85';
            const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
            
            const orderInfo = `Thanh toan don hang ${newOrder.orderCode}`;
            const redirectUrl = 'http://localhost:8000/api/order/momo-callback';
            const ipnUrl = 'http://localhost:8000/api/order/momo-callback'; // Dùng chung callback cho đơn giản ở localhost
            const requestType = 'captureWallet';
            const extraData = '';
            
            // Mã hóa đơn phía Momo cần unique, ta nối thêm timestamp
            const requestId = newOrder._id.toString() + new Date().getTime();
            const orderId = requestId; 
            const amount = newOrder.finalPrice.toString();

            // Tạo chữ ký Signature
            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
            const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

            const requestBody = JSON.stringify({
                partnerCode,
                partnerName: "Test Portfolio",
                storeId: "MomoTestStore",
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                lang: 'vi',
                requestType,
                autoCapture: true,
                extraData,
                orderGroupId: '',
                signature
            });

            // Gửi request sang Momo
            const options = {
                hostname: 'test-payment.momo.vn',
                port: 443,
                path: '/v2/gateway/api/create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };

            return new Promise((resolve, reject) => {
                const reqMomo = https.request(options, (resMomo) => {
                    let data = '';
                    resMomo.on('data', (chunk) => { data += chunk; });
                    resMomo.on('end', () => {
                        const response = JSON.parse(data);
                        if(response.resultCode === 0) {
                            // Lưu lại requestId của momo vào order để sau này đối soát nếu cần (tùy chọn)
                            // newOrder.paymentId = requestId; await newOrder.save();
                            
                            resolve(new Created({
                                message: 'Vui lòng thanh toán qua Momo',
                                metadata: { 
                                    order: newOrder, 
                                    paymentUrl: response.payUrl 
                                }
                            }).send(res));
                        } else {
                            reject(new BadRequestError('Lỗi tạo thanh toán Momo: ' + response.message));
                        }
                    });
                });
                reqMomo.on('error', (e) => reject(new BadRequestError('Lỗi kết nối Momo')));
                reqMomo.write(requestBody);
                reqMomo.end();
            }).catch(err => { throw err; });
        }
    }

    // 2. CALLBACK VNPAY
    async vnpayCallback(req, res) {
        const { vnp_ResponseCode, vnp_TxnRef } = req.query;

        if (vnp_ResponseCode === '00') {
            const order = await orderModel.findByIdAndUpdate(vnp_TxnRef, {
                status: 'confirmed',
                isPaid: true,
                paidAt: new Date()
            }, { new: true });

            if (!order) throw new NotFoundError('Không tìm thấy đơn hàng');

            // Thông báo
            await NotificationController.pushNoti({
                userId: order.userId,
                title: 'Thanh toán thành công',
                message: `Đơn hàng ${order.orderCode} đã thanh toán qua VNPay thành công.`,
                type: 'ORDER',
                metadata: { orderId: order._id }
            });

            return new OK({ message: 'Thanh toán VNPay thành công', metadata: order }).send(res);
        } else {
            return new BadRequestError('Thanh toán thất bại');
        }
    }

    // 3. CALLBACK MOMO
    async momoCallback(req, res) {
        const { resultCode, extraData, orderId } = req.query; 
        // Lưu ý: orderId ở đây là chuỗi "ID_Đơn + Timestamp" ta gửi đi lúc checkout
        
        if (resultCode == '0') {
            // Tách lấy ID đơn hàng gốc (Cắt bỏ phần timestamp phía sau)
            // ID Mongo có độ dài 24 ký tự
            const realOrderId = orderId.substring(0, 24); 

            const order = await orderModel.findByIdAndUpdate(realOrderId, {
                status: 'confirmed',
                isPaid: true,
                paidAt: new Date()
            }, { new: true });

            if (!order) throw new NotFoundError('Không tìm thấy đơn hàng');

            // Thông báo
            await NotificationController.pushNoti({
                userId: order.userId,
                title: 'Thanh toán thành công',
                message: `Đơn hàng ${order.orderCode} đã thanh toán qua Momo thành công.`,
                type: 'ORDER',
                metadata: { orderId: order._id }
            });

            return new OK({ message: 'Thanh toán Momo thành công', metadata: order }).send(res);
        } else {
            return new BadRequestError('Thanh toán Momo thất bại');
        }
    }

    // 4. LẤY DANH SÁCH ĐƠN HÀNG
    async getMyOrders(req, res) {
        const userId = req.user;
        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
        return new OK({
            message: 'Lấy danh sách đơn hàng thành công',
            metadata: orders
        }).send(res);
    }
    
    // 5. LẤY CHI TIẾT ĐƠN HÀNG
    async getOrderDetail(req, res) {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);
        if(!order) throw new NotFoundError('Đơn hàng không tồn tại');
        return new OK({
            message: 'Lấy chi tiết đơn hàng thành công',
            metadata: order
        }).send(res);
    }
}

module.exports = new OrderController();
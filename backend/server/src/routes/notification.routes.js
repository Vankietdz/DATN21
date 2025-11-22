const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../auth/checkAuth');
const { authUser } = require('../middleware/authUser');
const NotificationController = require('../controllers/notification.controller'); // Class
const notificationController = new NotificationController(); // Instance

// Lấy danh sách thông báo
router.get('/list', authUser, asyncHandler(notificationController.getMyNotifications));

// Đánh dấu đã đọc
router.patch('/read', authUser, asyncHandler(notificationController.markAsRead));

module.exports = router;
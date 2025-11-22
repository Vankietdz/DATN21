const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../auth/checkAuth'); // Hoặc đường dẫn file utils của bạn
const { authUser } = require('../middleware/authUser');
const newsController = require('../controllers/news.controller');

// --- Public Routes (Hoặc Private tùy nghiệp vụ) ---
router.get('/list', asyncHandler(newsController.getAllNews));
router.get('/detail/:newsId', asyncHandler(newsController.getNewsDetail));

// --- Protected Routes (Cần đăng nhập/Admin) ---
router.post('/create', authUser, asyncHandler(newsController.createNews));
router.put('/update/:newsId', authUser, asyncHandler(newsController.updateNews));
router.delete('/delete/:newsId', authUser, asyncHandler(newsController.deleteNews));

module.exports = router;
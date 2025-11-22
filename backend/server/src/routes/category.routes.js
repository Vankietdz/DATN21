const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Ensure upload directory exists
const uploadDir = 'src/uploads/categorys';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
    },
});

const { asyncHandler } = require('../auth/checkAuth');
const { authAdmin } = require('../middleware/authUser');

const categoryController = require('../controllers/category.controller');

router.post('/create', authAdmin, upload.single('imageCategory'), asyncHandler(categoryController.createCategory));
router.get('/list', asyncHandler(categoryController.getAllCategory));
router.put('/update/:id', authAdmin, upload.single('imageCategory'), asyncHandler(categoryController.updateCategory));
router.delete('/delete/:id', authAdmin, asyncHandler(categoryController.deleteCategory));

module.exports = router;

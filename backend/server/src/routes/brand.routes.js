const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Config Multer (Upload file)
const uploadDir = 'src/uploads/brands';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

const { asyncHandler } = require('../auth/checkAuth');
const { authAdmin } = require('../middleware/authUser');
const brandController = require('../controllers/brand.controller');

router.post('/create', authAdmin, upload.single('logo'), asyncHandler(brandController.createBrand));
router.get('/list', asyncHandler(brandController.getAllBrands));
router.delete('/delete/:id', authAdmin, asyncHandler(brandController.deleteBrand));

module.exports = router;
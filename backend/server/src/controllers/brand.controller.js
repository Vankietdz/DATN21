const brandModel = require('../models/brand.model');
const cloudinary = require('../config/cloudDinary');
const { Created, OK } = require('../core/success.response');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const fs = require('fs/promises');
const getPublicId = require('../utils/getPublicId');

class BrandController {
    
    // Tạo thương hiệu
    async createBrand(req, res) {
        if (!req.file) throw new BadRequestError('Vui lòng chọn logo thương hiệu');

        const { path, filename } = req.file;
        const { name, description } = req.body;

        if (!name) {
            if (path) await fs.unlink(path).catch(() => {});
            throw new BadRequestError('Tên thương hiệu là bắt buộc');
        }

        try {
            // Upload Cloudinary
            const uploadResult = await cloudinary.uploader.upload(path, {
                folder: 'brands',
                resource_type: 'image',
            });

            const newBrand = await brandModel.create({
                name,
                description,
                logoUrl: uploadResult.url
            });

            // Xóa file tạm
            await fs.unlink(path).catch(() => {});

            return new Created({
                message: 'Tạo thương hiệu thành công',
                metadata: newBrand
            }).send(res);

        } catch (error) {
            if (path) await fs.unlink(path).catch(() => {});
            throw new BadRequestError('Lỗi upload ảnh: ' + error.message);
        }
    }

    // Lấy tất cả
    async getAllBrands(req, res) {
        const brands = await brandModel.find({ status: 'active' }).sort({ createdAt: -1 });
        return new OK({
            message: 'Lấy danh sách thương hiệu thành công',
            metadata: brands
        }).send(res);
    }

    // Xóa thương hiệu
    async deleteBrand(req, res) {
        const { id } = req.params;
        const brand = await brandModel.findById(id);
        if (!brand) throw new NotFoundError('Thương hiệu không tồn tại');

        // Xóa ảnh trên cloud
        if (brand.logoUrl) {
            try {
                const publicId = getPublicId(brand.logoUrl);
                await cloudinary.uploader.destroy(publicId);
            } catch (e) {
                console.error('Lỗi xóa ảnh cũ:', e);
            }
        }

        await brandModel.findByIdAndDelete(id);
        return new OK({ message: 'Xóa thành công', metadata: {} }).send(res);
    }
}

module.exports = new BrandController();
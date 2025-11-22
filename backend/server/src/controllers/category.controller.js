const cloudinary = require('../config/cloudDinary');
const categoryModel = require('../models/category.model');
const { Created, OK } = require('../core/success.response');
const { BadRequestError, NotFoundError } = require('../core/error.response');

const fs = require('fs/promises');

const getPublicId = require('../utils/getPublicId');

class CategoryController {
    async createCategory(req, res) {
        if (!req.file) {
            throw new BadRequestError('Vui lòng chọn ảnh danh mục');
        }

        const { path, filename } = req.file;
        const { nameCategory } = req.body;

        if (!nameCategory || !path || !filename) {
            if (path) await fs.unlink(path).catch(() => {});
            throw new BadRequestError('Thiếu thông tin danh mục');
        }

        try {
            console.log('Uploading to Cloudinary:', { path, filename, nameCategory });
            const uploadResult = await cloudinary.uploader.upload(path, {
                folder: 'categorys',
                resource_type: 'image',
            });

            console.log('Cloudinary upload result:', uploadResult.url);

            const newCategory = await categoryModel.create({
                nameCategory,
                imageCategory: uploadResult.url,
            });

            await fs.unlink(path).catch(() => {});

            return new Created({
                message: 'Tạo danh mục thành công',
                metadata: newCategory,
            }).send(res);
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            if (path) await fs.unlink(path).catch(() => {});
            throw new BadRequestError('Lỗi khi upload ảnh lên Cloudinary: ' + error.message);
        }
    }

    async getAllCategory(req, res) {
        const categories = await categoryModel.find();
        return new OK({
            message: 'Lấy danh mục thành công',
            metadata: categories,
        }).send(res);
    }

    async updateCategory(req, res) {
        const { id } = req.params;
        const { nameCategory } = req.body;
        if (!nameCategory || !id) {
            throw new BadRequestError('Thiếu thông tin danh mục');
        }

        const findCategory = await categoryModel.findById(id);
        if (!findCategory) {
            throw new NotFoundError('Danh mục không tồn tại');
        }

        let imageCategory = findCategory.imageCategory;
        const oldImageUrl = findCategory.imageCategory;

        if (req.file) {
            const { path, filename } = req.file;
            console.log('Updating category with new image:', { path, filename, nameCategory });

            try {
                // Upload new image first
                const uploadResult = await cloudinary.uploader.upload(path, {
                    folder: 'categorys',
                    resource_type: 'image',
                });

                imageCategory = uploadResult.url;
                console.log('New image uploaded:', imageCategory);

                // Delete old image from Cloudinary (if it exists and is a Cloudinary URL)
                if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
                    try {
                        const oldPublicId = getPublicId(oldImageUrl);
                        await cloudinary.uploader.destroy(oldPublicId);
                        console.log('Old image deleted from Cloudinary:', oldPublicId);
                    } catch (destroyError) {
                        console.warn('Could not delete old image:', destroyError.message);
                    }
                }

                // Delete temporary file
                await fs.unlink(path).catch(() => {});
            } catch (error) {
                console.error('Error uploading to Cloudinary:', error);
                if (path) await fs.unlink(path).catch(() => {});
                throw new BadRequestError('Lỗi khi upload ảnh lên Cloudinary: ' + error.message);
            }
        }

        const updateCategory = await categoryModel.findByIdAndUpdate(
            id,
            { nameCategory, imageCategory },
            { new: true },
        );

        return new OK({
            message: 'Cập nhật danh mục thành công',
            metadata: updateCategory,
        }).send(res);
    }

    async deleteCategory(req, res) {
        const { id } = req.params;

        if (!id) {
            throw new BadRequestError('Thiếu thông tin danh mục');
        }

        const findCategory = await categoryModel.findById(id);

        if (!findCategory) {
            throw new NotFoundError('Danh mục không tồn tại');
        }

        await cloudinary.uploader.destroy(getPublicId(findCategory.imageCategory));

        await findCategory.deleteOne();

        return new OK({
            message: 'Xóa danh mục thành công',
            metadata: findCategory,
        }).send(res);
    }
}

module.exports = new CategoryController();

const cloudinary = require('../config/cloudDinary');
const typeModel = require('../models/type.model');
const { Created, OK } = require('../core/success.response');
const { BadRequestError, NotFoundError } = require('../core/error.response');

const fs = require('fs/promises');

const getPublicId = require('../utils/getPublicId');

class TypeController {
    async createType(req, res) {
        if (!req.file) {
            throw new BadRequestError('Vui lòng chọn ảnh loại');
        }

        const { path, filename } = req.file;
        const { nameType } = req.body;

        if (!nameType || !path || !filename) {
            if (path) await fs.unlink(path).catch(() => {});
            throw new BadRequestError('Thiếu thông tin loại');
        }

        try {
            console.log('Uploading to Cloudinary:', { path, filename, nameType });
            const uploadResult = await cloudinary.uploader.upload(path, {
                folder: 'types',
                resource_type: 'image',
            });

            console.log('Cloudinary upload result:', uploadResult.url);

            const newType = await typeModel.create({
                nameType,
                imageType: uploadResult.url,
            });

            await fs.unlink(path).catch(() => {});

            return new Created({
                message: 'Tạo loại thành công',
                metadata: newType,
            }).send(res);
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            if (path) await fs.unlink(path).catch(() => {});
            throw new BadRequestError('Lỗi khi upload ảnh lên Cloudinary: ' + error.message);
        }
    }

    async getAllType(req, res) {
        const types = await typeModel.find();
        return new OK({
            message: 'Lấy loại thành công',
            metadata: types,
        }).send(res);
    }

    async updateType(req, res) {
        const { id } = req.params;
        const { nameType } = req.body;
        if (!nameType || !id) {
            throw new BadRequestError('Thiếu thông tin loại');
        }

        const findType = await typeModel.findById(id);
        if (!findType) {
            throw new NotFoundError('Loại không tồn tại');
        }

        let imageType = findType.imageType;
        const oldImageUrl = findType.imageType;

        if (req.file) {
            const { path, filename } = req.file;
            console.log('Updating type with new image:', { path, filename, nameType });

            try {
                // Upload new image first
                const uploadResult = await cloudinary.uploader.upload(path, {
                    folder: 'types',
                    resource_type: 'image',
                });

                imageType = uploadResult.url;
                console.log('New image uploaded:', imageType);

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

        const updateType = await typeModel.findByIdAndUpdate(id, { nameType, imageType }, { new: true });

        return new OK({
            message: 'Cập nhật loại thành công',
            metadata: updateType,
        }).send(res);
    }

    async deleteType(req, res) {
        const { id } = req.params;

        if (!id) {
            throw new BadRequestError('Thiếu thông tin loại');
        }

        const findType = await typeModel.findById(id);

        if (!findType) {
            throw new NotFoundError('Loại không tồn tại');
        }

        // Delete image from Cloudinary if it's a Cloudinary URL
        if (findType.imageType && findType.imageType.includes('cloudinary.com')) {
            try {
                await cloudinary.uploader.destroy(getPublicId(findType.imageType));
            } catch (destroyError) {
                console.warn('Could not delete image from Cloudinary:', destroyError.message);
            }
        }

        await findType.deleteOne();

        return new OK({
            message: 'Xóa loại thành công',
            metadata: findType,
        }).send(res);
    }
}

module.exports = new TypeController();

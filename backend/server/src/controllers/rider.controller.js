const cloudinary = require('../config/cloudDinary');
const riderModel = require('../models/rider.model');
const { Created, OK } = require('../core/success.response');
const { BadRequestError, NotFoundError } = require('../core/error.response');

const fs = require('fs/promises');

const getPublicId = require('../utils/getPublicId');

class RiderController {
    async createRider(req, res) {
        if (!req.file) {
            throw new BadRequestError('Vui lòng chọn ảnh tay đua');
        }

        const { path, filename } = req.file;
        const { nameRider } = req.body;

        if (!nameRider || !path || !filename) {
            if (path) await fs.unlink(path).catch(() => {});
            throw new BadRequestError('Thiếu thông tin tay đua');
        }

        try {
            console.log('Uploading to Cloudinary:', { path, filename, nameRider });
            const uploadResult = await cloudinary.uploader.upload(path, {
                folder: 'riders',
                resource_type: 'image',
            });

            console.log('Cloudinary upload result:', uploadResult.url);

            const newRider = await riderModel.create({
                nameRider,
                imageRider: uploadResult.url,
            });

            await fs.unlink(path).catch(() => {});

            return new Created({
                message: 'Tạo tay đua thành công',
                metadata: newRider,
            }).send(res);
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            if (path) await fs.unlink(path).catch(() => {});
            throw new BadRequestError('Lỗi khi upload ảnh lên Cloudinary: ' + error.message);
        }
    }

    async getAllRider(req, res) {
        const riders = await riderModel.find();
        return new OK({
            message: 'Lấy danh sách tay đua thành công',
            metadata: riders,
        }).send(res);
    }

    async updateRider(req, res) {
        const { id } = req.params;
        const { nameRider } = req.body;
        if (!nameRider || !id) {
            throw new BadRequestError('Thiếu thông tin tay đua');
        }

        const findRider = await riderModel.findById(id);
        if (!findRider) {
            throw new NotFoundError('Tay đua không tồn tại');
        }

        let imageRider = findRider.imageRider;
        const oldImageUrl = findRider.imageRider;

        if (req.file) {
            const { path, filename } = req.file;
            console.log('Updating rider with new image:', { path, filename, nameRider });

            try {
                // Upload new image first
                const uploadResult = await cloudinary.uploader.upload(path, {
                    folder: 'riders',
                    resource_type: 'image',
                });

                imageRider = uploadResult.url;
                console.log('New image uploaded:', imageRider);

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

        const updateRider = await riderModel.findByIdAndUpdate(id, { nameRider, imageRider }, { new: true });

        return new OK({
            message: 'Cập nhật tay đua thành công',
            metadata: updateRider,
        }).send(res);
    }

    async deleteRider(req, res) {
        const { id } = req.params;

        if (!id) {
            throw new BadRequestError('Thiếu thông tin tay đua');
        }

        const findRider = await riderModel.findById(id);

        if (!findRider) {
            throw new NotFoundError('Tay đua không tồn tại');
        }

        // Delete image from Cloudinary if it's a Cloudinary URL
        if (findRider.imageRider && findRider.imageRider.includes('cloudinary.com')) {
            try {
                await cloudinary.uploader.destroy(getPublicId(findRider.imageRider));
            } catch (destroyError) {
                console.warn('Could not delete image from Cloudinary:', destroyError.message);
            }
        }

        await findRider.deleteOne();

        return new OK({
            message: 'Xóa tay đua thành công',
            metadata: findRider,
        }).send(res);
    }
}

module.exports = new RiderController();

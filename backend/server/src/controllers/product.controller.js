const cloudinary = require('../config/cloudDinary');
const { Created, OK } = require('../core/success.response');
const { NotFoundError, BadRequestError } = require('../core/error.response');
const getPublicId = require('../utils/getPublicId');
const productModel = require('../models/product.model');
const fs = require('fs/promises');

class ProductController {
    // ... (Giữ nguyên hàm createProduct)
    async createProduct(req, res) {
        const dataImages = req.files;
        const {
            nameProduct,
            priceProduct,
            discountProduct,
            stockProduct,
            descriptionProduct,
            categoryProduct,
            typeProduct,
            riderProduct,
            metadata,
        } = req.body;
        if (
            !nameProduct ||
            !priceProduct ||
            !discountProduct ||
            !stockProduct ||
            !descriptionProduct ||
            !categoryProduct ||
            !dataImages ||
            !metadata
        ) {
            throw new BadRequestError('Thiếu thông tin sản phẩm');
        }

        let imagesProduct = [];

        for (const image of dataImages) {
            const { path, filename } = image;
            const { url } = await cloudinary.uploader.upload(path, {
                folder: 'products',
                resource_type: 'image',
            });
            imagesProduct.push(url || filename);
            // Xóa file tạm sau khi upload
            await fs.unlink(path).catch(() => {}); 
        }

        const productData = {
            nameProduct,
            priceProduct,
            discountProduct,
            stockProduct,
            descriptionProduct,
            categoryProduct,
            metadata: JSON.parse(metadata),
            imagesProduct,
        };

        if (typeProduct) productData.typeProduct = typeProduct;
        if (riderProduct) productData.riderProduct = riderProduct;

        const newProduct = await productModel.create(productData);

        return new Created({
            message: 'Tạo sản phẩm thành công',
            metadata: newProduct,
        }).send(res);
    }

    // --- NÂNG CẤP HÀM LẤY DANH SÁCH ---
    async getAllProduct(req, res) {
        const { 
            page = 1, 
            limit = 12, 
            keyword, 
            category, 
            type, 
            rider, 
            minPrice, 
            maxPrice, 
            sort = 'newest' 
        } = req.query;

        // 1. Xây dựng bộ lọc
        const filter = {};
        
        if (keyword) {
            // Tìm kiếm tương đối theo tên (không phân biệt hoa thường)
            filter.nameProduct = { $regex: keyword, $options: 'i' };
        }

        if (category) filter.categoryProduct = category;
        if (type) filter.typeProduct = type;
        if (rider) filter.riderProduct = rider;

        if (minPrice || maxPrice) {
            filter.priceProduct = {};
            if (minPrice) filter.priceProduct.$gte = Number(minPrice);
            if (maxPrice) filter.priceProduct.$lte = Number(maxPrice);
        }

        // 2. Xử lý sắp xếp
        let sortCondition = {};
        switch (sort) {
            case 'price_asc': sortCondition = { priceProduct: 1 }; break; // Giá thấp -> cao
            case 'price_desc': sortCondition = { priceProduct: -1 }; break; // Giá cao -> thấp
            case 'oldest': sortCondition = { createdAt: 1 }; break;
            case 'newest': 
            default: sortCondition = { createdAt: -1 }; break; // Mới nhất
        }

        // 3. Tính toán phân trang
        const skip = (Number(page) - 1) * Number(limit);

        // 4. Query DB
        const products = await productModel.find(filter)
            .sort(sortCondition)
            .skip(skip)
            .limit(Number(limit))
            .populate('categoryProduct', 'nameCategory') // Lấy tên danh mục
            .populate('typeProduct', 'nameType')
            .populate('riderProduct', 'nameRider');

        const totalProducts = await productModel.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / Number(limit));

        return new OK({
            message: 'Lấy danh sách sản phẩm thành công',
            metadata: {
                products,
                pagination: {
                    total: totalProducts,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages
                }
            },
        }).send(res);
    }

    // ... (Giữ nguyên các hàm update, delete, getById)
    async updateProduct(req, res) {
        const { id } = req.params;
        const {
            nameProduct,
            priceProduct,
            discountProduct,
            stockProduct,
            descriptionProduct,
            categoryProduct,
            typeProduct,
            riderProduct,
            metadata,
            oldImagesProduct,
        } = req.body;

        const dataImages = req.files;

        if (!id) throw new BadRequestError('Thiếu ID sản phẩm');

        const findProduct = await productModel.findById(id);
        if (!findProduct) throw new NotFoundError('Sản phẩm không tồn tại');

        let imagesProduct = [];

        if (dataImages && dataImages.length > 0) {
            for (const image of dataImages) {
                const { path, filename } = image;
                const { url } = await cloudinary.uploader.upload(path, {
                    folder: 'products',
                    resource_type: 'image',
                });
                imagesProduct.push(url || filename);
                await fs.unlink(path).catch(() => {});
            }
        }

        const parserOldImages = oldImagesProduct ? JSON.parse(oldImagesProduct) : [];
        const finalImages = [...parserOldImages, ...imagesProduct];
        const parserMetadata = metadata ? JSON.parse(metadata) : undefined;

        const updateData = {
            nameProduct,
            priceProduct,
            discountProduct,
            stockProduct,
            descriptionProduct,
            categoryProduct,
            metadata: parserMetadata,
            imagesProduct: finalImages,
        };

        if (typeProduct) updateData.typeProduct = typeProduct;
        else updateData.typeProduct = null;

        if (riderProduct) updateData.riderProduct = riderProduct;
        else updateData.riderProduct = null;

        const updateProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });

        return new OK({
            message: 'Cập nhật thông tin sản phẩm thành công',
            metadata: updateProduct,
        }).send(res);
    }

    async getProductById(req, res) {
        const { id } = req.params;
        const product = await productModel.findById(id)
            .populate('categoryProduct')
            .populate('riderProduct')
            .populate('typeProduct');
            
        if (!product) {
            throw new NotFoundError('Sản phẩm không tồn tại');
        }

        return new OK({
            message: 'Lấy thông tin sản phẩm thành công',
            metadata: product,
        }).send(res);
    }

    async deleteProduct(req, res) {
        const { id } = req.params;
        const findProduct = await productModel.findById(id);
        if (!findProduct) throw new NotFoundError('Sản phẩm không tồn tại');

        for (const image of findProduct.imagesProduct) {
            if (image.includes('cloudinary')) {
                try {
                    await cloudinary.uploader.destroy(getPublicId(image));
                } catch (e) { console.log(e) }
            }
        }

        await findProduct.deleteOne();
        return new OK({ message: 'Xóa sản phẩm thành công', metadata: findProduct }).send(res);
    }
}

module.exports = new ProductController();
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const typeRoutes = require('./type.routes');
const riderRoutes = require('./rider.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const couponRoutes = require('./coupon.routes');
const newsRoutes = require('./news.routes');
const reviewRoutes = require('./review.routes');
const orderRoutes = require('./order.routes');
const statisticRoutes = require('./statistic.routes');
const wishlistRoutes = require('./wishlist.routes');
const notificationRoutes = require('./notification.routes');
const brandRoutes = require('./brand.routes');

function routes(app) {
    app.use('/api/user', userRoutes);
    app.use('/api/category', categoryRoutes);
    app.use('/api/type', typeRoutes);
    app.use('/api/rider', riderRoutes);
    app.use('/api/product', productRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/coupon', couponRoutes);
    app.use('/api/news', newsRoutes);
    app.use('/api/review', reviewRoutes);
    app.use('/api/order', orderRoutes);
    app.use('/api/statistic', statisticRoutes);
    app.use('/api/wishlist', wishlistRoutes);
    app.use('/api/notification', notificationRoutes);
    app.use('/api/brand', brandRoutes);
}

module.exports = routes;

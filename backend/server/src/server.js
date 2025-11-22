const express = require('express');
const app = express();
const port = 8000;

const bodyParser = require('body-parser');

const routes = require('./routes/index.routes');
const connectDB = require('./config/connectDB');
const cookieParser = require('cookie-parser');

// CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

connectDB();

routes(app);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message || 'lỗi server',
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

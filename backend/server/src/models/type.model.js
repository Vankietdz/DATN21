const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const typeModel = new Schema(
    {
        nameType: { type: String, minlength: 6, require: true },
        imageType: { type: String, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('type', typeModel);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const riderModel = new Schema(
    {
        nameRider: { type: String, minlength: 6, require: true },
        imageRider: { type: String, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('rider', riderModel);

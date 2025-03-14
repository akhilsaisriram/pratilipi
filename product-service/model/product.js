const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productname: {
        type: String,
        required: [true, 'Product name is required']
    },
    description: {
        type: String,
        required: true
    },
    reviews: [reviewSchema],

    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    dislikes: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    unitsavailable: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt:{
       type : Date,
       default : Date.now
    }
}, { timestamps : true });

module.exports = mongoose.model('Product', productSchema);

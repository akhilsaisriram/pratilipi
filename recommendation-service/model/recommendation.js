const mongoose = require('mongoose');

const order_recom = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    categories: [String],
    subCategories: [String],
    companies: [String],
    productNames: [String],
    prices: [Number],
}, { timestamps: true });

const OrderRecom = mongoose.model('order_recom', order_recom);

const productSearchSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
     
    },
    categories: [String],
    subCategories: [String],
    companies: [String],
    productNames: [String],
    prices: [Number],
    likes:{
        type: Number,
        default: 0
    }
}, { timestamps: true });

const ProductSearch = mongoose.model('ProductSearch', productSearchSchema);

module.exports = { OrderRecom, ProductSearch };


const Product = require('../model/product');
const validatedata = require('./validaror');

exports.addproduct = async (req, res) => {
    const { isValid, errors } = validatedata(req.body);

    if (!isValid) {
        return res.status(400).json({ success: false, errors });
    }

    try {
        const productData = {
            userId: req.body.userId,
            productname: req.body.productname,
            description: req.body.description,
            price: req.body.price,
            unitsavailable: req.body.unitsavailable,
            category: req.body.category,
            images: req.body.images || [],
        };

        const newProduct = await Product.create(productData);
        res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    try {
        const products = await Product.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalProducts = await Product.countDocuments();

        res.status(200).json({
            success: true,
            page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.filteredproduct = async (req, res) => {
    const { name, category, minPrice, maxPrice, rating } = req.params;
  if (!name && !category && !minPrice && !maxPrice && !rating) {
      return res.status(400).json({ message: 'At least one filter parameter is required' });
    }

    let filterQuery = {};

    if (name) filterQuery.productname = { $regex: name, $options: 'i' };
    if (category) filterQuery.category = category;
    
    if (rating) filterQuery.rating = { $gte: Number(rating) };

    if (minPrice || maxPrice) {
        filterQuery.price = {};
        if (minPrice) filterQuery.price.$gte = Number(minPrice);
        if (maxPrice) filterQuery.price.$lte = Number(maxPrice);
    }

    try {
        const filteredProducts = await Product.find(filterQuery).sort({ createdAt: -1 });

        res.status(200).json({
            totalResults: filteredProducts.length,
            products: filteredProducts
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateproduct = async (req, res) => {
    const productId = req.params.id;

    const { isValid, errors } = validatedata(req.body);

    if (!isValid) {
        return res.status(400).json({  errors });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({  message: 'Product not found' });
        }

        res.status(200).json({ success: true, product: updatedProduct });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addreview = async (req, res) => {
    const { productId } = req.params;
    const { username, userid, message } = req.body;

    if (!username || !userid || !message) {
        return res.status(400).json({ success: false, message: 'username, userid, and message are required.' });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const newReview = {
            username,
            userid,
            message,
            createdAt: new Date()
        };

        product.reviews.push(newReview);

        await product.save();

        return res.status(201).json({ success: true, message: 'Review added successfully.', reviews: product.reviews });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


exports.updaterating = async (req, res) => {
    try {
        const { productId, userId } = req.params;
        const { action } = req.body;

        if (!productId || !userId || !action) {
            return res.status(400).json({ message: 'Product ID, User ID, and action are required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const userObjectId = userId;

        if (action === 'like') {
            if (!product.likes.includes(userObjectId)) {
                product.likes.push(userObjectId);
                product.dislikes = product.dislikes.filter(id => id.toString() !== userObjectId);
            }
        } else if (action === 'dislike') {
            if (!product.dislikes.includes(userObjectId)) {
                product.dislikes.push(userObjectId);
                product.likes = product.likes.filter(id => id.toString() !== userObjectId);
            }
        } else {
            return res.status(400).json({ message: 'Invalid action. Use "like" or "dislike".' });
        }

        await product.save();
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

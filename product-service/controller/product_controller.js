const Product = require("../model/product");
const validatedata = require("./validaror");
const RabbitMQService = require("../config/rabbitmq");



exports.inventory_check = async (message) => {
  const { orderId, order } = message;
  console.log("order");

  try {
    const productIds = order.products.map((p) => p.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    let isStockAvailable = true;
    let insufficientProducts = [];

    for (const item of order.products) {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (!product || product.unitsavailable < item.quantity) {
        isStockAvailable = false;
        insufficientProducts.push({
          productId: item.productId,
          name: item.name,
        });
      }
    }

    const mess = isStockAvailable ? "ok" : "not ok";
    const messagea = {
      message: mess,
      orderId: order._id,
    };

    if (isStockAvailable) {
      for (const item of order.products) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { unitsavailable: -item.quantity } }
        );
      }
    }

    await RabbitMQService.sendtoqueue(
      "inventory_check_queue_from_product_ack",
      messagea
    );
  } catch (error) {
    console.error("Error processing inventory check:", error);
  }
};





// Start consuming messages
RabbitMQService.consumeMessage(
  'order_exchange',  
  'inventory_queue', 
  'inventory.check', 
  exports.inventory_check 
);



exports.addproduct = async (req, res) => {
  const { isValid, errors } = validatedata.validatedata(req.body);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const existingProduct = await Product.findOne({
      productname: req.body.productname,
      userId: req.body.userId,
      company: req.body.company
  });

  if (existingProduct) {
      return res.status(400).json({
          success: false,
          message: "Product already exists for this user and company."
      });
  }
    const productData = {
      userId: req.body.userId,
      productname: req.body.productname,
      description: req.body.description,
      price: req.body.price,
      unitsavailable: req.body.unitsavailable,
      category: req.body.category,
      subcategory: req.body.subcategory,
      company: req.body.company,

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
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.filteredproduct = async (req, res) => {
  const { name, category, subcategory, company, minPrice, maxPrice, rating } =
    req.params;
  if (
    !name &&
    !category &&
    !subcategory &&
    !company &&
    !minPrice &&
    !maxPrice &&
    !rating
  ) {
    return res
      .status(400)
      .json({ message: "At least one filter parameter is required" });
  }

  let filterQuery = {};

  if (name) filterQuery.productname = { $regex: name, $options: "i" };
  if (category) filterQuery.category = category;
  if (subcategory) filterQuery.subcategory = subcategory;
  if (company) filterQuery.company = company;

  if (rating) filterQuery.rating = { $gte: Number(rating) };

  if (minPrice || maxPrice) {
    filterQuery.price = {};
    if (minPrice) filterQuery.price.$gte = Number(minPrice);
    if (maxPrice) filterQuery.price.$lte = Number(maxPrice);
  }

  try {
    const filteredProducts = await Product.find(filterQuery).sort({
      createdAt: -1,
    });

    res.status(200).json({
      totalResults: filteredProducts.length,
      products: filteredProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getProductById = async (req, res) => {
    try {
        const { id,userId } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const queueName = "product_search"; 
        const data={
          product:product,
          userId:userId
        }
        await RabbitMQService.sendtoqueue(queueName, data);
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.updateproduct = async (req, res) => {
  const productId = req.params.id;

  const { isValid, errors } = validatedata(req.body);

  if (!isValid) {
    return res.status(400).json({ errors });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
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
    return res.status(400).json({
      success: false,
      message: "username, userid, and message are required.",
    });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    const newReview = {
      username,
      userid,
      message,
      createdAt: new Date(),
    };

    product.reviews.push(newReview);

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully.",
      reviews: product.reviews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updaterating = async (req, res) => {
  try {
    const { productId, userId } = req.params;
    const { action } = req.body;

    if (!productId || !userId || !action) {
      return res
        .status(400)
        .json({ message: "Product ID, User ID, and action are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const userObjectId = userId;

    if (action === "like") {
      if (!product.likes.includes(userObjectId)) {
        product.likes.push(userObjectId);
        product.dislikes = product.dislikes.filter(
          (id) => id.toString() !== userObjectId
        );
      }
    } else if (action === "dislike") {
      if (!product.dislikes.includes(userObjectId)) {
        product.dislikes.push(userObjectId);
        product.likes = product.likes.filter(
          (id) => id.toString() !== userObjectId
        );
      }
    } else {
      return res
        .status(400)
        .json({ message: 'Invalid action. Use "like" or "dislike".' });
    }

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecommendedProducts = async (recommendationData) => {
  try {
    const { categories, subcategories, companies, productNames, productIds } =
      recommendationData;

    query = {
      $or: [
        { category: { $in: categories } },
        { subcategory: { $in: subcategories } },
        { company: { $in: companies } },
        ...productNames.map((name) => ({
          productname: { $regex: new RegExp(name, "i") }, // Partial case-insensitive match
        })),
        { _id: { $in: productIds } },
      ],
    };

    const maxPriceProduct = await Product.findOne(query)
      .sort({ price: -1 })
      .select("price");
    const maxPrice = maxPriceProduct ? maxPriceProduct.price : Infinity;

    const recommendedProducts = await Product.find({
      ...query,
      price: { $lte: maxPrice },
    })
      .sort({ likes: -1 })
      .limit(20);
    await RabbitMQService.sendtoqueue(
      "recommendation_from_product",
      recommendedProducts
    );
    return recommendedProducts;
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    throw error;
  }
};

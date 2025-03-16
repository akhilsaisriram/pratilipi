const Order = require("../model/order");
const order_validator = require("./validator");
const RabbitMQService = require("../config/rabbitmq"); // Import the RabbitMQ service
exports.getordersbyuser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { nondelivered } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    let query = { userId };
    if (nondelivered === "true") {
      query.isDelivered = false;
    } else {
      query.isDelivered = true;
    }
    const orders = await Order.find(query).sort({ orderDate: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getorderbyid = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "order ID is required" });
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.createorder = async (req, res) => {
  try {
    const orderData = req.body;
    const order = new Order(orderData);

    // Calculate total price before validation
    order.totalPrice = order.calculateTotalPrice();

    // Validate after setting totalPrice
    const errors = order_validator.validator(order);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    await order.save();

    // await inventorycheck(order);
    const messagea = {
      orderId: order._id,
      order: order
  };
    // await RabbitMQService.sendtoqueue("inventory_check_queue", messagea);
    await RabbitMQService.publishMessage(
      "order_exchange", // exchange name
      "inventory.check", // routing key
      messagea // message
    );

    res.status(201).json({
      message: "Order received. We will notify you about the status via email.",
      orderId: order._id,
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "order ID is required" });
    }
    const updates = req.body;
    const errors = order_validator.validateorderupdate(updates);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (updates.products) {
      Object.assign(order, updates);
      order.totalPrice = order.calculateTotalPrice();
    } else {
      Object.assign(order, updates);
    }

    await order.save();

    // await inventorycheck(order);
    const messagea = {
      orderId: order._id,
      order: order
  };
    // await RabbitMQService.sendtoqueue("inventory_check_queue", messagea);
    await RabbitMQService.publishMessage(
      "order_exchange", // exchange name
      "inventory.check", // routing key
      messagea // message
    );

    res.status(201).json({
      message: "updated Order received. We will notify you about the status via email.",
      orderId: order._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "order ID is required" });
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.deleteOne({ _id: orderId });
    // await rabbitMQService.publishMessage("order_events", "order.deleted", {
    //   deleted_order_id: orderId,
    //   timestamp: new Date(),
    // });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.get_recommendation = async (userId) => {
  try {

      // Fetch user's past orders
      const orders = await Order.find({ userId });

      if (!orders.length) {
          return res.status(404).json({ message: "No orders found for this user." });
      }

      // Use a single iteration to extract unique values
      const uniqueValues = {
          categories: new Set(),
          subcategories: new Set(),
          companies: new Set(),
          productNames: new Set(),
          productid: new Set(),

      };

      orders.forEach(order => {
          order.products.forEach(product => {
              uniqueValues.categories.add(product.category);
              uniqueValues.subcategories.add(product.subcategory);
              uniqueValues.companies.add(product.company);
              uniqueValues.productNames.add(product.name);
              uniqueValues.productid.add(product.productId);

          });
      });

    const data=json({
          categories: Array.from(uniqueValues.categories),
          subcategories: Array.from(uniqueValues.subcategories),
          companies: Array.from(uniqueValues.companies),
          productNames: Array.from(uniqueValues.productNames)
      })
      await RabbitMQService.sendtoqueue("recommendations_from_order", recommendationData);

      return data;
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}
